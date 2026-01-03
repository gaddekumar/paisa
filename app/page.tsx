'use client';

import { useState } from 'react';
import InvestmentModal from './components/InvestmentModal';
import AgeCalculator from './components/AgeCalculator';
import { formatCurrency } from './utils/currency';
import { calculateEquity, calculateRemainingLoanBalance } from './utils/loan';

export interface Investment {
  id: string;
  type: 'portfolio' | 'real-estate' | 'loan';
  name: string;
  amount: number;
  date: string;
  cagr: number;
  // Real estate specific fields
  downpayment?: number;
  houseCost?: number;
  loanTerm?: number; // in years
  annualInterestRate?: number; // as percentage (e.g., 5 for 5%)
  // Loan specific fields
  loanAmount?: number;
  loanInterestRate?: number; // as percentage (e.g., 5 for 5%)
  loanTermYears?: number; // in years
}

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investmentType, setInvestmentType] = useState<'portfolio' | 'real-estate' | 'loan' | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [yearsToRetirement, setYearsToRetirement] = useState<number | null>(null);
  const [isAgeSet, setIsAgeSet] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [inflationRate, setInflationRate] = useState(3);

  const projectedValueAtRetirement =
    yearsToRetirement === null
      ? null
      : investments.reduce((sum, inv) => {
          if (inv.type === 'loan') return sum; // Loans are liabilities, not assets

          if (
            inv.type === 'real-estate' &&
            inv.downpayment !== undefined &&
            inv.houseCost !== undefined &&
            inv.loanTerm !== undefined &&
            inv.annualInterestRate !== undefined
          ) {
            // For real estate, calculate future equity at retirement horizon
            const loanAmount = inv.houseCost - inv.downpayment;
            const purchaseDateObj = new Date(inv.date);
            const today = new Date();
            const yearsElapsed = (today.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            const yearsAtRetirement = yearsElapsed + yearsToRetirement;
            const futureValue = inv.houseCost * Math.pow(1 + inv.cagr / 100, yearsAtRetirement);
            const remainingLoanAtRetirement = calculateRemainingLoanBalance(
              loanAmount,
              inv.annualInterestRate,
              inv.loanTerm,
              yearsAtRetirement
            );
            const futureEquity = futureValue - remainingLoanAtRetirement;
            return sum + Math.max(0, futureEquity);
          }

          if (inv.type === 'portfolio') {
            const futureValue = inv.amount * Math.pow(1 + inv.cagr / 100, yearsToRetirement);
            return sum + futureValue;
          }

          return sum;
        }, 0);

  const inflationAdjustedValue =
    yearsToRetirement === null || projectedValueAtRetirement === null
      ? null
      : projectedValueAtRetirement / Math.pow(1 + inflationRate / 100, yearsToRetirement);

  const liabilityAtRetirement =
    yearsToRetirement === null
      ? null
      : investments.reduce((sum, inv) => {
          if (
            inv.type === 'loan' &&
            inv.loanAmount !== undefined &&
            inv.loanInterestRate !== undefined &&
            inv.loanTermYears !== undefined
          ) {
            const loanDateObj = new Date(inv.date);
            const today = new Date();
            const yearsElapsed = (today.getTime() - loanDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            const yearsAtRetirement = yearsElapsed + yearsToRetirement;
            return (
              sum +
              calculateRemainingLoanBalance(inv.loanAmount, inv.loanInterestRate, inv.loanTermYears, yearsAtRetirement)
            );
          }

          if (
            inv.type === 'real-estate' &&
            inv.downpayment !== undefined &&
            inv.houseCost !== undefined &&
            inv.loanTerm !== undefined &&
            inv.annualInterestRate !== undefined
          ) {
            const loanAmount = inv.houseCost - inv.downpayment;
            const purchaseDateObj = new Date(inv.date);
            const today = new Date();
            const yearsElapsed = (today.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            const yearsAtRetirement = yearsElapsed + yearsToRetirement;
            return (
              sum +
              calculateRemainingLoanBalance(loanAmount, inv.annualInterestRate, inv.loanTerm, yearsAtRetirement)
            );
          }

          return sum;
        }, 0);

  const handleAddInvestment = (investment: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
    };
    setInvestments([...investments, newInvestment]);
    setIsModalOpen(false);
    setInvestmentType(null);
    setEditingInvestment(null);
  };

  const handleUpdateInvestment = (investment: Omit<Investment, 'id'>) => {
    if (editingInvestment) {
      setInvestments(investments.map(inv => 
        inv.id === editingInvestment.id ? { ...investment, id: editingInvestment.id } : inv
      ));
      setIsModalOpen(false);
      setEditingInvestment(null);
      setInvestmentType(null);
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setInvestmentType(investment.type);
    setIsModalOpen(true);
  };

  const handleRemoveInvestment = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const handleUpdateCAGR = (id: string, newCAGR: number) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...inv, cagr: newCAGR } : inv
    ));
  };

  const openModal = (type: 'portfolio' | 'real-estate' | 'loan') => {
    setInvestmentType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInvestmentType(null);
    setEditingInvestment(null);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">paisa</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-3">
          <button
            onClick={() => openModal('portfolio')}
            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
          >
            Add Portfolio Investment
          </button>
          <button
            onClick={() => openModal('real-estate')}
            className="w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
          >
            Add Real Estate Investment
          </button>
          <button
            onClick={() => openModal('loan')}
            className="w-full px-4 py-3 text-left bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
          >
            Add Loan
          </button>
        </aside>

        {/* Center - Investment List */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <AgeCalculator 
                onYearsToRetirementChange={setYearsToRetirement}
                onAgeSetChange={setIsAgeSet}
                onCurrencyChange={setSelectedCurrency}
                onInflationChange={setInflationRate}
              />
            </div>
            
            {/* Total Portfolio Value */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 min-w-[240px]">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-medium text-gray-700">Projected Value at Retirement</span>
                  <div className="text-2xl font-bold text-green-700">
                    {projectedValueAtRetirement === null ? '—' : formatCurrency(projectedValueAtRetirement, selectedCurrency)}
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <span className="text-xs font-medium text-gray-700">In Today&apos;s Money (Adjusted for Inflation)</span>
                  <div className="text-xl font-bold text-blue-700">
                    {inflationAdjustedValue === null ? '—' : formatCurrency(inflationAdjustedValue, selectedCurrency)}
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <span className="text-xs font-medium text-gray-700">Total Liability at Retirement</span>
                  <div className="text-xl font-bold text-red-700">
                    {liabilityAtRetirement === null ? '—' : formatCurrency(liabilityAtRetirement, selectedCurrency)}
                  </div>
                </div>

                {yearsToRetirement === null && (
                  <div className="pt-2 border-t border-blue-200 text-[11px] text-gray-600">
                    Set Date of Birth and retirement age to see values.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Investments</h2>
          <div className="flex gap-4">
            {/* Left Panel - Investments */}
            <div className="flex-1">
              {investments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No investments added yet.</p>
                  <p className="text-sm mt-2">Click a button on the left to add your first investment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            investment.type === 'portfolio'
                              ? 'bg-blue-100 text-blue-700'
                              : investment.type === 'real-estate'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {investment.type === 'portfolio'
                            ? 'Portfolio'
                            : investment.type === 'real-estate'
                            ? 'Real Estate'
                            : 'Loan'}
                        </span>
                        <h3 className="font-semibold text-gray-900">{investment.name}</h3>
                        {investment.type === 'portfolio' && (
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-gray-500">CAGR:</span>
                            <input
                              type="number"
                              value={investment.cagr}
                              onChange={(e) => {
                                const newCAGR = parseFloat(e.target.value);
                                if (!isNaN(newCAGR) && newCAGR >= 0 && newCAGR <= 30) {
                                  handleUpdateCAGR(investment.id, newCAGR);
                                }
                              }}
                              className="w-16 px-2 py-1 text-xs font-bold text-blue-600 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              step="0.1"
                              min="0"
                              max="30"
                            />
                            <span className="text-xs text-gray-500">%</span>
                            <input
                              type="range"
                              value={investment.cagr}
                              onChange={(e) => {
                                const newCAGR = parseFloat(e.target.value);
                                if (!isNaN(newCAGR)) {
                                  handleUpdateCAGR(investment.id, newCAGR);
                                }
                              }}
                              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((investment.cagr - 0) / 30) * 100}%, #e5e7eb ${((investment.cagr - 0) / 30) * 100}%, #e5e7eb 100%)`
                              }}
                              min="0"
                              max="30"
                              step="0.1"
                            />
                          </div>
                        )}
                        {investment.type === 'real-estate' && (
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-gray-500">Appreciation:</span>
                            <input
                              type="number"
                              value={investment.cagr}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value);
                                if (!isNaN(newRate) && newRate >= 0 && newRate <= 25) {
                                  handleUpdateCAGR(investment.id, newRate);
                                }
                              }}
                              className="w-16 px-2 py-1 text-xs font-bold text-green-700 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                              step="0.1"
                              min="0"
                              max="25"
                            />
                            <span className="text-xs text-gray-500">%</span>
                            <input
                              type="range"
                              value={investment.cagr}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value);
                                if (!isNaN(newRate)) {
                                  handleUpdateCAGR(investment.id, newRate);
                                }
                              }}
                              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((investment.cagr - 0) / 25) * 100}%, #e5e7eb ${((investment.cagr - 0) / 25) * 100}%, #e5e7eb 100%)`
                              }}
                              min="0"
                              max="25"
                              step="0.1"
                            />
                          </div>
                        )}
                      </div>
                      {investment.type === 'loan' ? (
                        <>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(investment.loanAmount || 0, selectedCurrency)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="text-gray-500">
                              Interest Rate: <span className="font-semibold text-gray-700">{investment.loanInterestRate}%</span>
                            </span>
                            <span className="text-gray-500">
                              Term: <span className="font-semibold text-gray-700">{investment.loanTermYears} years</span>
                            </span>
                            <span className="text-gray-500">
                              Date: {new Date(investment.date).toLocaleDateString()}
                            </span>
                          </div>
                          {investment.loanAmount !== undefined && investment.loanInterestRate !== undefined && 
                           investment.loanTermYears !== undefined && (
                            <p className="text-sm text-red-600 mt-1">
                              Remaining: {formatCurrency(
                                calculateRemainingLoanBalance(
                                  investment.loanAmount,
                                  investment.loanInterestRate,
                                  investment.loanTermYears,
                                  (new Date().getTime() - new Date(investment.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
                                ),
                                selectedCurrency
                              )}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-gray-800">
                            {formatCurrency(investment.amount, selectedCurrency)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            {investment.type !== 'portfolio' && investment.type !== 'real-estate' && (
                              <span className="text-gray-500">
                                CAGR: <span className="font-semibold text-gray-700">{investment.cagr}%</span>
                              </span>
                            )}
                            {investment.type === 'real-estate' && (
                              <span className="text-gray-500">
                                Date: {new Date(investment.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditInvestment(investment)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                        title="Edit investment"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveInvestment(investment.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                        title="Remove investment"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel - Empty for now */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
              {/* Empty panel - reserved for future use */}
            </div>
          </div>
        </main>
      </div>

      {/* Investment Modal */}
      {isModalOpen && investmentType && (
        <InvestmentModal
          type={investmentType}
          onClose={closeModal}
          onSubmit={editingInvestment ? handleUpdateInvestment : handleAddInvestment}
          isAgeSet={isAgeSet}
          currency={selectedCurrency}
          editingInvestment={editingInvestment}
        />
      )}
    </div>
  );
}
