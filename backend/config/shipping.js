// Shipping zones based on pincode patterns (Hyderabad focus)
export const SHIPPING_ZONES = {
  // Local: Hyderabad core areas
  local: {
    name: 'Local Delivery',
    pincodePatterns: ['500001', '500002', '500003', '500004', '500005', '500006', '500007', '500008', '500009', '500010', '500011', '500012', '500013', '500015', '500016', '500018', '500020', '500022', '500024', '500025', '500026', '500027', '500028', '500029', '500030', '500031', '500032', '500033', '500034', '500035', '500036', '500038', '500039', '500040', '500050', '500055', '500056', '500057', '500058', '500059', '500060', '500061', '500062', '500063', '500064', '500065', '500066', '500067', '500068', '500070', '500072', '500073', '500074', '500075', '500076', '500078', '500081', '500082', '500083', '500084', '500085', '500087', '500088', '500089', '500090', '500095', '500096', '500097', '500098'],
    charge: 40,
    freeShippingThreshold: 500,
    estimatedDays: '1-2 days'
  },
  // State: Telangana & Andhra Pradesh
  state: {
    name: 'State Delivery',
    pincodePrefixes: ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '515', '516', '517', '518', '519', '520', '521', '522', '523', '524', '530', '531', '532', '533', '534', '535'],
    charge: 80,
    freeShippingThreshold: 799,
    estimatedDays: '2-3 days'
  },
  // National: Rest of India
  national: {
    name: 'National Delivery',
    charge: 120,
    freeShippingThreshold: 1499,
    estimatedDays: '3-5 days'
  }
};

export const FREE_SHIPPING_MESSAGE = '🎉 Free Shipping Applied!';

// Helper: Check if pincode matches a zone
export const getShippingZone = (pincode) => {
  if (!pincode || pincode.length !== 6) return SHIPPING_ZONES.national;
  
  const cleanedPin = pincode.trim();
  
  // Check local exact matches
  if (SHIPPING_ZONES.local.pincodePatterns.includes(cleanedPin)) {
    return SHIPPING_ZONES.local;
  }
  
  // Check state prefix matches
  const prefix = cleanedPin.slice(0, 3);
  if (SHIPPING_ZONES.state.pincodePrefixes?.includes(prefix)) {
    return SHIPPING_ZONES.state;
  }
  
  // Default to national
  return SHIPPING_ZONES.national;
};

// Helper: Calculate final shipping charge
export const calculateShipping = (pincode, cartTotal) => {
  const zone = getShippingZone(pincode);
  const threshold = zone.freeShippingThreshold;
  
  if (cartTotal >= threshold) {
    return {
      charge: 0,
      zone: zone.name,
      message: FREE_SHIPPING_MESSAGE,
      estimatedDays: zone.estimatedDays,
      isFree: true
    };
  }
  
  return {
    charge: zone.charge,
    zone: zone.name,
    message: `Standard ${zone.name} shipping`,
    estimatedDays: zone.estimatedDays,
    isFree: false
  };
};