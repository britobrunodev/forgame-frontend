export type CountryOption = {
  code: string;
  flag: string;
  nameEn: string;
  namePt: string;
  dialCode: string;
  postalPlaceholder: string;
  phonePlaceholder: string;
  postalPattern?: string;
  phonePattern?: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'BR', flag: '🇧🇷', nameEn: 'Brazil', namePt: 'Brasil', dialCode: '+55', postalPlaceholder: '00000-000', phonePlaceholder: '(11) 98765-4321', postalPattern: '#####-###', phonePattern: '(##) #####-####' },
  { code: 'US', flag: '🇺🇸', nameEn: 'United States', namePt: 'Estados Unidos', dialCode: '+1', postalPlaceholder: '10001', phonePlaceholder: '(201) 555-0123', phonePattern: '(###) ###-####' },
  { code: 'CA', flag: '🇨🇦', nameEn: 'Canada', namePt: 'Canadá', dialCode: '+1', postalPlaceholder: 'M5V 3L9', phonePlaceholder: '(416) 555-0123', phonePattern: '(###) ###-####' },
  { code: 'MX', flag: '🇲🇽', nameEn: 'Mexico', namePt: 'México', dialCode: '+52', postalPlaceholder: '01000', phonePlaceholder: '55 1234 5678', phonePattern: '## #### ####' },
  { code: 'AR', flag: '🇦🇷', nameEn: 'Argentina', namePt: 'Argentina', dialCode: '+54', postalPlaceholder: '1000', phonePlaceholder: '11 1234 5678', phonePattern: '## #### ####' },
  { code: 'UY', flag: '🇺🇾', nameEn: 'Uruguay', namePt: 'Uruguai', dialCode: '+598', postalPlaceholder: '11000', phonePlaceholder: '91 234 567', phonePattern: '## ### ###' },
  { code: 'PY', flag: '🇵🇾', nameEn: 'Paraguay', namePt: 'Paraguai', dialCode: '+595', postalPlaceholder: '001201', phonePlaceholder: '981 234 567', phonePattern: '### ### ###' },
  { code: 'CL', flag: '🇨🇱', nameEn: 'Chile', namePt: 'Chile', dialCode: '+56', postalPlaceholder: '8320000', phonePlaceholder: '9 1234 5678', phonePattern: '# #### ####' },
  { code: 'CO', flag: '🇨🇴', nameEn: 'Colombia', namePt: 'Colômbia', dialCode: '+57', postalPlaceholder: '110111', phonePlaceholder: '300 123 4567', phonePattern: '### ### ####' },
  { code: 'PE', flag: '🇵🇪', nameEn: 'Peru', namePt: 'Peru', dialCode: '+51', postalPlaceholder: '15001', phonePlaceholder: '912 345 678', phonePattern: '### ### ###' },
  { code: 'PT', flag: '🇵🇹', nameEn: 'Portugal', namePt: 'Portugal', dialCode: '+351', postalPlaceholder: '1000-001', phonePlaceholder: '912 345 678', postalPattern: '####-###', phonePattern: '### ### ###' },
  { code: 'ES', flag: '🇪🇸', nameEn: 'Spain', namePt: 'Espanha', dialCode: '+34', postalPlaceholder: '28001', phonePlaceholder: '612 345 678', phonePattern: '### ### ###' },
  { code: 'FR', flag: '🇫🇷', nameEn: 'France', namePt: 'França', dialCode: '+33', postalPlaceholder: '75001', phonePlaceholder: '06 12 34 56 78', phonePattern: '## ## ## ## ##' },
  { code: 'DE', flag: '🇩🇪', nameEn: 'Germany', namePt: 'Alemanha', dialCode: '+49', postalPlaceholder: '10115', phonePlaceholder: '1512 3456789', phonePattern: '#### #######' },
  { code: 'IT', flag: '🇮🇹', nameEn: 'Italy', namePt: 'Itália', dialCode: '+39', postalPlaceholder: '00118', phonePlaceholder: '312 345 6789', phonePattern: '### ### ####' },
  { code: 'GB', flag: '🇬🇧', nameEn: 'United Kingdom', namePt: 'Reino Unido', dialCode: '+44', postalPlaceholder: 'SW1A 1AA', phonePlaceholder: '07911 123456', phonePattern: '##### ######' },
  { code: 'IE', flag: '🇮🇪', nameEn: 'Ireland', namePt: 'Irlanda', dialCode: '+353', postalPlaceholder: 'D02 X285', phonePlaceholder: '085 123 4567', phonePattern: '### ### ####' },
  { code: 'NL', flag: '🇳🇱', nameEn: 'Netherlands', namePt: 'Países Baixos', dialCode: '+31', postalPlaceholder: '1012 AB', phonePlaceholder: '06 12345678', phonePattern: '## ########' },
  { code: 'BE', flag: '🇧🇪', nameEn: 'Belgium', namePt: 'Bélgica', dialCode: '+32', postalPlaceholder: '1000', phonePlaceholder: '0470 12 34 56', phonePattern: '#### ## ## ##' },
  { code: 'CH', flag: '🇨🇭', nameEn: 'Switzerland', namePt: 'Suíça', dialCode: '+41', postalPlaceholder: '8001', phonePlaceholder: '078 123 45 67', phonePattern: '### ### ## ##' },
  { code: 'SE', flag: '🇸🇪', nameEn: 'Sweden', namePt: 'Suécia', dialCode: '+46', postalPlaceholder: '111 22', phonePlaceholder: '070 123 45 67', phonePattern: '### ### ## ##' },
  { code: 'NO', flag: '🇳🇴', nameEn: 'Norway', namePt: 'Noruega', dialCode: '+47', postalPlaceholder: '0150', phonePlaceholder: '406 12 345', phonePattern: '### ## ###' },
  { code: 'DK', flag: '🇩🇰', nameEn: 'Denmark', namePt: 'Dinamarca', dialCode: '+45', postalPlaceholder: '1050', phonePlaceholder: '20 12 34 56', phonePattern: '## ## ## ##' },
  { code: 'FI', flag: '🇫🇮', nameEn: 'Finland', namePt: 'Finlândia', dialCode: '+358', postalPlaceholder: '00100', phonePlaceholder: '040 123 4567', phonePattern: '### ### ####' },
  { code: 'AU', flag: '🇦🇺', nameEn: 'Australia', namePt: 'Austrália', dialCode: '+61', postalPlaceholder: '2000', phonePlaceholder: '0412 345 678', phonePattern: '#### ### ###' },
  { code: 'NZ', flag: '🇳🇿', nameEn: 'New Zealand', namePt: 'Nova Zelândia', dialCode: '+64', postalPlaceholder: '6011', phonePlaceholder: '021 123 4567', phonePattern: '### ### ####' },
  { code: 'JP', flag: '🇯🇵', nameEn: 'Japan', namePt: 'Japão', dialCode: '+81', postalPlaceholder: '100-0001', phonePlaceholder: '090 1234 5678', postalPattern: '###-####', phonePattern: '### #### ####' },
  { code: 'KR', flag: '🇰🇷', nameEn: 'South Korea', namePt: 'Coreia do Sul', dialCode: '+82', postalPlaceholder: '03045', phonePlaceholder: '010 1234 5678', phonePattern: '### #### ####' },
  { code: 'CN', flag: '🇨🇳', nameEn: 'China', namePt: 'China', dialCode: '+86', postalPlaceholder: '100000', phonePlaceholder: '131 2345 6789', phonePattern: '### #### ####' },
  { code: 'IN', flag: '🇮🇳', nameEn: 'India', namePt: 'Índia', dialCode: '+91', postalPlaceholder: '110001', phonePlaceholder: '98765 43210', phonePattern: '##### #####' },
  { code: 'AE', flag: '🇦🇪', nameEn: 'United Arab Emirates', namePt: 'Emirados Árabes Unidos', dialCode: '+971', postalPlaceholder: '00000', phonePlaceholder: '50 123 4567', phonePattern: '## ### ####' },
  { code: 'ZA', flag: '🇿🇦', nameEn: 'South Africa', namePt: 'África do Sul', dialCode: '+27', postalPlaceholder: '0001', phonePlaceholder: '82 123 4567', phonePattern: '## ### ####' },
  { code: 'AO', flag: '🇦🇴', nameEn: 'Angola', namePt: 'Angola', dialCode: '+244', postalPlaceholder: '1000', phonePlaceholder: '923 456 789', phonePattern: '### ### ###' },
];

export const getCountryOption = (code: string) =>
  COUNTRY_OPTIONS.find((country) => country.code === code) ?? COUNTRY_OPTIONS[0];

export const getCountryLabel = (code: string, language: 'en' | 'pt-BR') => {
  const country = getCountryOption(code);
  return language === 'pt-BR' ? country.namePt : country.nameEn;
};

const applyPattern = (input: string, pattern: string) => {
  const chars = input.replace(/\D/g, '').split('');
  let result = '';
  let index = 0;

  for (const token of pattern) {
    if (token === '#') {
      if (!chars[index]) break;
      result += chars[index];
      index += 1;
      continue;
    }

    if (index < chars.length) {
      result += token;
    }
  }

  return result;
};

export const formatPostalCode = (countryCode: string, value: string) => {
  const country = getCountryOption(countryCode);
  if (!country.postalPattern) return value.toUpperCase();
  return applyPattern(value, country.postalPattern);
};

export const formatPhoneNumber = (countryCode: string, value: string) => {
  const country = getCountryOption(countryCode);
  const digits = value.replace(/\D/g, '');

  if (!country.phonePattern) {
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }

  return applyPattern(digits, country.phonePattern);
};
