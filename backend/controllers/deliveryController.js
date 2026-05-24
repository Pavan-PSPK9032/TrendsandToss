function getRuleBasedCharge(pincode) {
  const pincodeNum = parseInt(pincode);
  if (pincodeNum >= 100000 && pincodeNum <= 599999) return 40;
  if (pincodeNum >= 600000 && pincodeNum <= 799999) return 50;
  return 60;
}

export const checkDelivery = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ available: false, message: 'Invalid pincode format. Must be 6 digits.' });
    }

    const charge = getRuleBasedCharge(pincode);

    res.json({
      available: true,
      pincode,
      charge,
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

    const results = pincodes.map((pincode) => {
      let charge = getRuleBasedCharge(pincode);
      if (orderValue >= 500) charge = 0;
      return { pincode, charge, available: true };
    });

    res.json(results);
  } catch (err) {
    console.error('Bulk delivery charges error:', err);
    res.status(500).json({ error: 'Failed to calculate delivery charges' });
  }
};
