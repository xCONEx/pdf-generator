
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
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      if (value === 0) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatCurrency(value));
      }
    }
  }, [value, isFocused]);

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrency = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    
    // Remove símbolos de moeda e espaços
    let cleaned = str.replace(/[R$\s]/g, '');
    
    // Se não tem vírgula nem ponto, trata como centavos se for menor que 100
    if (!cleaned.includes(',') && !cleaned.includes('.')) {
      const num = parseInt(cleaned) || 0;
      return num;
    }
    
    // Se tem vírgula e ponto, vírgula é decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      const lastComma = cleaned.lastIndexOf(',');
      const lastDot = cleaned.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Formato brasileiro: 1.234,56
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato americano: 1,234.56
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Só vírgula - assumir como decimal brasileiro
      cleaned = cleaned.replace(',', '.');
    }
    
    return parseFloat(cleaned) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    if (inputValue === '') {
      onChange(0);
      return;
    }

    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // No foco, mostrar apenas o número formatado sem R$
    if (value > 0) {
      setDisplayValue(formatNumber(value));
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // No blur, mostrar com R$
    if (value > 0) {
      setDisplayValue(formatCurrency(value));
    } else {
      setDisplayValue('');
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default PriceInput;
