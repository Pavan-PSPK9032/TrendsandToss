const DELHIVERY_BASE = 'https://track.delhivery.com/api/kinko/v1/invoice/charges/.json';

async function getDelhiveryRate(pincode, weight = 200) {
  const apiKey = process.env.DELHIVERY_API_KEY;
  const pickupPincode = process.env.DELHIVERY_PICKUP_PINCODE || '500001';

  if (!apiKey) return null;

  const params = new URLSearchParams({
    md: 'E',
    ss: 'Delivered',
    d_pin: pincode,
    o_pin: pickupPincode,
    cgm: String(weight),
  });

  try {
    const res = await fetch(`${DELHIVERY_BASE}?${params}`, {
      headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

function getRuleBasedCharge(pincode) {
  const pincodeNum = parseInt(pincode);
  if (pincodeNum >= 100000 && pincodeNum <= 599999) return 40;
  if (pincodeNum >= 600000 && pincodeNum <= 799999) return 50;
  return 60;
}

function buildBreakdown(rate) {
  if (!rate) return null;
  return {
    base: Math.round(rate.charge_DL || 0),
    fuelSurcharge: Math.round(rate.charge_FOV || 0),
    odaSurcharge: Math.round(rate.charge_ODA || 0),
    rtoCharge: Math.round(rate.charge_RTO || 0),
    gst: Math.round(rate.gst || 0),
    total: Math.round(rate.total_amount || rate.gross_amount || 0),
    zone: rate.zone || 'Unknown',
    suppliedBy: rate.supply_type || 'Forward',
  };
}

export const checkDelivery = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ available: false, message: 'Invalid pincode format. Must be 6 digits.' });
    }

    const rate = await getDelhiveryRate(pincode);

    if (rate) {
      const breakdown = buildBreakdown(rate);
      return res.json({
        available: true,
        pincode,
        charge: breakdown.total,
        source: 'delhivery',
        breakdown,
        estimatedDays: '3-5 business days',
        message: 'Delivery available',
      });
    }

    const charge = getRuleBasedCharge(pincode);

    res.json({
      available: true,
      pincode,
      charge,
      source: 'rule',
      estimatedDays: '3-5 business days',
      message: 'Delivery available',
    });
  } catch (err) {
    console.error('Delivery check error:', err);
    res.status(500).json({ available: false, message: 'Failed to check delivery availability' });
  }
};

export const getDeliveryCharges = async (req, res) => {
  try {
    const { pincodes, orderValue } = req.body;

    if (!Array.isArray(pincodes)) {
      return res.status(400).json({ error: 'Pincodes must be an array' });
    }

    const results = await Promise.all(
      pincodes.map(async (pincode) => {
        const rate = await getDelhiveryRate(pincode);
        let charge = 50;
        let breakdown = null;
        if (rate) {
          breakdown = buildBreakdown(rate);
          charge = breakdown.total;
        } else {
          charge = getRuleBasedCharge(pincode);
        }
        if (orderValue >= 500) charge = 0;
        return { pincode, charge, breakdown, available: true };
      })
    );

    res.json(results);
  } catch (err) {
    console.error('Bulk delivery charges error:', err);
    res.status(500).json({ error: 'Failed to calculate delivery charges' });
  }
};
