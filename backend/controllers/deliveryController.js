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
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

export const checkDelivery = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ available: false, message: 'Invalid pincode format. Must be 6 digits.' });
    }

    const rate = await getDelhiveryRate(pincode);

    if (rate) {
      return res.json({
        available: true,
        pincode,
        charge: Math.round(rate.total_amount || rate.gross_amount || rate.charge_DL || 50),
        totalAmount: rate.total_amount,
        grossAmount: rate.gross_amount,
        baseCharge: rate.charge_DL,
        chargedWeight: rate.charged_weight,
        estimatedDays: '3-5 business days',
        message: 'Delivery available',
      });
    }

    // Fallback to rule-based if Delhivery fails
    const pincodeNum = parseInt(pincode);
    let charge = 50;

    if (pincodeNum >= 100000 && pincodeNum <= 599999) {
      charge = 40;
    } else if (pincodeNum >= 600000 && pincodeNum <= 799999) {
      charge = 50;
    } else {
      charge = 60;
    }

    res.json({
      available: true,
      pincode,
      charge,
      estimatedDays: '3-5 business days',
      message: 'Delivery available (estimated)',
      fallback: true,
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
        let available = true;

        if (rate) {
          charge = Math.round(rate.total_amount || rate.gross_amount || rate.charge_DL || 50);
        } else {
          const pincodeNum = parseInt(pincode);
          if (pincodeNum >= 100000 && pincodeNum <= 599999) charge = 40;
          else if (pincodeNum >= 600000 && pincodeNum <= 799999) charge = 50;
          else charge = 60;
        }

        if (orderValue >= 500) charge = 0;

        return { pincode, charge, available };
      })
    );

    res.json(results);
  } catch (err) {
    console.error('Bulk delivery charges error:', err);
    res.status(500).json({ error: 'Failed to calculate delivery charges' });
  }
};
