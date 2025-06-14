
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange, placeholder = "0,00", className }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatPrice(value));
    }
  }, [value]);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parsePrice = (str: string): number => {
    // Remove tudo exceto números, vírgulas e pontos
    const cleaned = str.replace(/[^\d.,]/g, '');
    
    // Se tem vírgula e ponto, assume que ponto é separador de milhares
    if (cleaned.includes(',') && cleaned.includes('.')) {
      const lastComma = cleaned.lastIndexOf(',');
      const lastDot = cleaned.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Vírgula é decimal: 1.234,56
        return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
      } else {
        // Ponto é decimal: 1,234.56
        return parseFloat(cleaned.replace(/,/g, ''));
      }
    }
    
    // Só vírgula - assumir como decimal
    if (cleaned.includes(',') && !cleaned.includes('.')) {
      return parseFloat(cleaned.replace(',', '.'));
    }
    
    // Só ponto - pode ser decimal ou milhares
    if (cleaned.includes('.') && !cleaned.includes(',')) {
      const parts = cleaned.split('.');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Provavelmente decimal
        return parseFloat(cleaned);
      } else {
        // Provavelmente separador de milhares
        return parseFloat(cleaned.replace(/\./g, ''));
      }
    }
    
    // Só números
    return parseFloat(cleaned) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    if (inputValue === '') {
      onChange(0);
      return;
    }

    const numericValue = parsePrice(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (value > 0) {
      setDisplayValue(formatPrice(value));
    }
  };

  const handleFocus = () => {
    if (value === 0) {
      setDisplayValue('');
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default PriceInput;
