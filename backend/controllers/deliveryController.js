// Check delivery availability and calculate charges
export const checkDelivery = async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Validate pincode format
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ 
        available: false, 
        message: 'Invalid pincode format. Must be 6 digits.' 
      });
    }

    // For now, using a simple rule-based system
    // You can integrate Delhivery/Shiprocket API here later
    
    // Major cities and their delivery charges
    const metroPincodes = {
      // Delhi NCR
      ranges: [[110001, 110099], [201301, 201310]], // Noida, Ghaziabad
      // Mumbai
      mumbai: [[400001, 400104]],
      // Bangalore
      bangalore: [[560001, 560103]],
      // Chennai
      chennai: [[600001, 600128]],
      // Kolkata
      kolkata: [[700001, 700162]],
      // Hyderabad
      hyderabad: [[500001, 500100]],
      // Pune
      pune: [[411001, 411057]]
    };

    const pincodeNum = parseInt(pincode);
    let isAvailable = false;
    let charge = 50; // Default delivery charge

    // Check if pincode falls in any metro range
    for (const city in metroPincodes) {
      for (const range of metroPincodes[city]) {
        if (pincodeNum >= range[0] && pincodeNum <= range[1]) {
          isAvailable = true;
          charge = 40; // Lower charge for metro cities
          break;
        }
      }
      if (isAvailable) break;
    }

    // For now, make all pincodes available with standard charge
    // In production, integrate with actual delivery API
    isAvailable = true;
    
    // Tier-based pricing
    if (pincodeNum >= 100000 && pincodeNum <= 599999) {
      charge = 40; // North/West - closer regions
    } else if (pincodeNum >= 600000 && pincodeNum <= 799999) {
      charge = 50; // South/East regions
    } else {
      charge = 60; // Other regions
    }

    res.json({
      available: isAvailable,
      pincode,
      charge,
      estimatedDays: isAvailable ? '3-5 business days' : 'N/A',
      message: isAvailable ? 'Delivery available' : 'Delivery not available in this area'
    });
  } catch (err) {
    console.error('Delivery check error:', err);
    res.status(500).json({ 
      available: false, 
      message: 'Failed to check delivery availability' 
    });
  }
};

// Get delivery charges for multiple pincodes (bulk check)
export const getDeliveryCharges = async (req, res) => {
  try {
    const { pincodes, orderValue } = req.body;
    
    if (!Array.isArray(pincodes)) {
      return res.status(400).json({ error: 'Pincodes must be an array' });
    }

    const results = pincodes.map(pincode => {
      const pincodeNum = parseInt(pincode);
      let charge = 50;

      if (pincodeNum >= 100000 && pincodeNum <= 599999) {
        charge = 40;
      } else if (pincodeNum >= 600000 && pincodeNum <= 799999) {
        charge = 50;
      } else {
        charge = 60;
      }

      // Free delivery for orders above ₹500
      if (orderValue >= 500) {
        charge = 0;
      }

      return {
        pincode,
        charge,
        available: true
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate delivery charges' });
  }
};
