// Unit conversion utilities

export const UNITS = {
  FEET: 'ft',
  METERS: 'm',
  CENTIMETERS: 'cm',
  INCHES: 'in'
};

export const UNIT_LABELS = {
  [UNITS.FEET]: 'Feet (ft)',
  [UNITS.METERS]: 'Meters (m)',
  [UNITS.CENTIMETERS]: 'Centimeters (cm)',
  [UNITS.INCHES]: 'Inches (in)'
};

// Convert any unit to feet (base unit for calculations)
export const convertToFeet = (value, fromUnit) => {
  switch (fromUnit) {
    case UNITS.FEET:
      return value;
    case UNITS.METERS:
      return value * 3.28084; // 1 meter = 3.28084 feet
    case UNITS.CENTIMETERS:
      return value * 0.0328084; // 1 cm = 0.0328084 feet
    case UNITS.INCHES:
      return value * 0.0833333; // 1 inch = 0.0833333 feet
    default:
      return value;
  }
};

// Convert from feet to any unit
export const convertFromFeet = (value, toUnit) => {
  switch (toUnit) {
    case UNITS.FEET:
      return value;
    case UNITS.METERS:
      return value / 3.28084; // 1 foot = 0.3048 meters
    case UNITS.CENTIMETERS:
      return value / 0.0328084; // 1 foot = 30.48 cm
    case UNITS.INCHES:
      return value / 0.0833333; // 1 foot = 12 inches
    default:
      return value;
  }
};

// Convert between any two units
export const convertUnits = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  const feetValue = convertToFeet(value, fromUnit);
  return convertFromFeet(feetValue, toUnit);
};

// Format display value with appropriate decimal places
export const formatDisplayValue = (value, unit) => {
  if (unit === UNITS.CENTIMETERS || unit === UNITS.INCHES) {
    return parseFloat(value.toFixed(2));
  }
  return parseFloat(value.toFixed(3));
};

// Get volume in cubic feet regardless of input unit
export const getVolumeInCubicFeet = (length, width, height, unit) => {
  const lengthInFeet = convertToFeet(length, unit);
  const widthInFeet = convertToFeet(width, unit);
  const heightInFeet = convertToFeet(height, unit);
  return lengthInFeet * widthInFeet * heightInFeet;
};
