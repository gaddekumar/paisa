'use client';

import { useState, useEffect } from 'react';

interface AgeCalculatorProps {
  onYearsToRetirementChange?: (years: number | null) => void;
  onAgeSetChange?: (isSet: boolean) => void;
  onCurrencyChange?: (currency: string) => void;
  onInflationChange?: (inflation: number) => void;
}

export default function AgeCalculator({ onYearsToRetirementChange, onAgeSetChange, onCurrencyChange, onInflationChange }: AgeCalculatorProps) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [retirementAgeInput, setRetirementAgeInput] = useState('65');
  const [currency, setCurrency] = useState('USD');
  const [inflation, setInflation] = useState('3');
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [retirementAge, setRetirementAge] = useState<number | null>(null);
  const [yearsToRetirement, setYearsToRetirement] = useState<number | null>(null);
  const [hasTouchedRetirementAge, setHasTouchedRetirementAge] = useState(false);

  const minRetirementAge = currentAge ?? 50;
  const maxRetirementAge = Math.max(80, minRetirementAge);

  useEffect(() => {
    // If DOB changes, treat retirement age as "not set by user" so we can re-apply defaults.
    setHasTouchedRetirementAge(false);
  }, [dateOfBirth]);

  useEffect(() => {
    if (currentAge === null) return;
    if (!hasTouchedRetirementAge) {
      const defaultRetirementAge = currentAge < 65 ? 65 : 80;
      const clampedDefault = Math.max(currentAge, defaultRetirementAge);
      const nextValue = String(clampedDefault);
      if (retirementAgeInput !== nextValue) setRetirementAgeInput(nextValue);
      return;
    }

    const retirement = parseInt(retirementAgeInput || String(currentAge));
    if (isNaN(retirement) || retirement < currentAge) {
      setRetirementAgeInput(String(currentAge));
    }
  }, [currentAge, retirementAgeInput, hasTouchedRetirementAge]);

  useEffect(() => {
    onCurrencyChange?.(currency);
  }, [currency, onCurrencyChange]);

  useEffect(() => {
    const inflationValue = parseFloat(inflation);
    if (!isNaN(inflationValue) && inflationValue >= 0) {
      onInflationChange?.(inflationValue);
    }
  }, [inflation, onInflationChange]);

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
    if (!dateOfBirth || !retirementAgeInput) {
      setCurrentAge(null);
      setRetirementAge(null);
      setYearsToRetirement(null);
      onYearsToRetirementChange?.(null);
      onAgeSetChange?.(false);
      return;
    }

    const age = calculateAge(dateOfBirth);
    const retirement = parseInt(retirementAgeInput);
    
    if (isNaN(retirement) || retirement < 1) {
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
  }, [dateOfBirth, retirementAgeInput, onYearsToRetirementChange, onAgeSetChange]);

  return (
    <div className="mb-4">
      {/* Date of Birth Box */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="w-40">
              <label htmlFor="dob" className="block text-xs font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-48">
              <label htmlFor="retirement-age" className="block text-xs font-medium text-gray-700 mb-1">
                Retirement Age: <span className="font-bold text-blue-600">{retirementAgeInput}</span>
              </label>
              <input
                type="range"
                id="retirement-age"
                value={retirementAgeInput}
                onChange={(e) => {
                  setHasTouchedRetirementAge(true);
                  setRetirementAgeInput(e.target.value);
                }}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                    (() => {
                      const value = parseInt(retirementAgeInput || '65');
                      const range = maxRetirementAge - minRetirementAge;
                      if (range <= 0) return 100;
                      const pct = ((value - minRetirementAge) / range) * 100;
                      return Math.min(100, Math.max(0, pct));
                    })()
                  }%, #e5e7eb ${
                    (() => {
                      const value = parseInt(retirementAgeInput || '65');
                      const range = maxRetirementAge - minRetirementAge;
                      if (range <= 0) return 100;
                      const pct = ((value - minRetirementAge) / range) * 100;
                      return Math.min(100, Math.max(0, pct));
                    })()
                  }%, #e5e7eb 100%)`
                }}
                min={minRetirementAge}
                max={maxRetirementAge}
                step="1"
              />
            </div>
            <div className="w-32">
              <label htmlFor="currency" className="block text-xs font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY (¥)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>
            <div className="w-28">
              <label htmlFor="inflation" className="block text-xs font-medium text-gray-700 mb-1">
                Inflation (%)
              </label>
              <input
                type="number"
                id="inflation"
                value={inflation}
                onChange={(e) => setInflation(e.target.value)}
                className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="3.0"
                step="0.1"
                min="0"
                max="20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Box */}
      {(currentAge !== null || retirementAge !== null) && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            {currentAge !== null && (
              <div>
                <span className="text-gray-600">Age: </span>
                <span className="font-semibold text-gray-900">{currentAge}</span>
              </div>
            )}
            {retirementAge !== null && (
              <div>
                <span className="text-gray-600">Retirement: </span>
                <span className="font-semibold text-gray-900">{retirementAge}</span>
              </div>
            )}
            {yearsToRetirement !== null && (
              <div>
                <span className="text-gray-600">Years Left: </span>
                <span className="font-bold text-blue-700">{yearsToRetirement}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

