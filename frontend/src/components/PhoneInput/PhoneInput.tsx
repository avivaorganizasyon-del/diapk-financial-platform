import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  Box,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { Phone } from '@mui/icons-material';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'TR', name: 'Türkiye', dialCode: '+90', flag: '🇹🇷' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  margin?: 'none' | 'dense' | 'normal';
  sx?: any;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  label = 'Telefon Numarası',
  required = false,
  fullWidth = true,
  margin = 'normal',
  sx,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to Turkey
  const [phoneNumber, setPhoneNumber] = useState('');

  // Parse existing value if provided
  React.useEffect(() => {
    if (value) {
      const country = countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.dialCode.length));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleCountryChange = (newCountry: Country) => {
    setSelectedCountry(newCountry);
    const fullNumber = newCountry.dialCode + phoneNumber;
    onChange(fullNumber);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setPhoneNumber(newPhoneNumber);
    const fullNumber = selectedCountry.dialCode + newPhoneNumber;
    onChange(fullNumber);
  };

  return (
    <FormControl fullWidth={fullWidth} margin={margin} error={error}>
      <Box sx={{ display: 'flex', gap: 1, ...sx }}>
        {/* Country Code Selector */}
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={selectedCountry.code}
            onChange={(e) => {
              const country = countries.find(c => c.code === e.target.value);
              if (country) handleCountryChange(country);
            }}
            displayEmpty
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(26, 35, 126, 0.02)',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.04)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(26, 35, 126, 0.06)',
                }
              }
            }}
          >
            {countries.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{country.flag}</span>
                  <span>{country.dialCode}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Phone Number Input */}
        <TextField
          required={required}
          fullWidth
          label={label}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          error={error}
          placeholder="5XX XXX XX XX"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(26, 35, 126, 0.02)',
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(26, 35, 126, 0.06)',
              }
            }
          }}
        />
      </Box>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PhoneInput;