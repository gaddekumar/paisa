'use client';

import { useState, useEffect } from 'react';

interface AgeCalculatorProps {
  onYearsToRetirementChange?: (years: number | null) => void;
  onAgeSetChange?: (isSet: boolean) => void;
  retirementAge?: number;
  dateOfBirth?: string;
}

export default function AgeCalculator({ onYearsToRetirementChange, onAgeSetChange, retirementAge: externalRetirementAge, dateOfBirth: externalDateOfBirth }: AgeCalculatorProps) {
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [retirementAge, setRetirementAge] = useState<number | null>(null);
  const [yearsToRetirement, setYearsToRetirement] = useState<number | null>(null);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    if (!externalDateOfBirth) {
      setCurrentAge(null);
      setRetirementAge(null);
      setYearsToRetirement(null);
      onYearsToRetirementChange?.(null);
      onAgeSetChange?.(false);
      return;
    }

    const age = calculateAge(externalDateOfBirth);
    const retirement = externalRetirementAge ?? 65;
    
    if (retirement < 1) {
      setCurrentAge(null);
      setRetirementAge(null);
      setYearsToRetirement(null);
      onYearsToRetirementChange?.(null);
      onAgeSetChange?.(false);
      return;
    }

    const yearsToRetire = retirement - age;

    setCurrentAge(age);
    setRetirementAge(retirement);
    const years = yearsToRetire >= 0 ? yearsToRetire : 0;
    setYearsToRetirement(years);
    onYearsToRetirementChange?.(years);
    onAgeSetChange?.(true);
  }, [externalDateOfBirth, externalRetirementAge, onYearsToRetirementChange, onAgeSetChange]);

  return null;
}

