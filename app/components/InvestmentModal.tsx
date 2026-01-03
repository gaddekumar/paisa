'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Investment } from '../page';
import { currencySymbols } from '../utils/currency';

interface InvestmentModalProps {
    type: 'portfolio' | 'real-estate' | 'loan';
    onClose: () => void;
    onSubmit: (investment: Omit<Investment, 'id'>) => void;
    isAgeSet: boolean;
    currency: string;
    editingInvestment?: Investment | null;
}

export default function InvestmentModal({ type, onClose, onSubmit, isAgeSet, currency, editingInvestment }: InvestmentModalProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [cagr, setCagr] = useState('10');
    const [downpayment, setDownpayment] = useState('');
    const [houseCost, setHouseCost] = useState('');
    const [loanTerm, setLoanTerm] = useState('');
    const [annualInterestRate, setAnnualInterestRate] = useState('');
    // Loan specific fields
    const [loanAmount, setLoanAmount] = useState('');
    const [loanInterestRate, setLoanInterestRate] = useState('');
    const [loanTermYears, setLoanTermYears] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (editingInvestment) {
            // Pre-populate form with existing investment data
            setName(editingInvestment.name);
            setAmount(editingInvestment.amount.toString());
            setDate(editingInvestment.date);
            setCagr(editingInvestment.cagr.toString());
            setDownpayment(editingInvestment.downpayment?.toString() || '');
            setHouseCost(editingInvestment.houseCost?.toString() || '');
            setLoanTerm(editingInvestment.loanTerm?.toString() || '');
            setAnnualInterestRate(editingInvestment.annualInterestRate?.toString() || '');
            setLoanAmount(editingInvestment.loanAmount?.toString() || '');
            setLoanInterestRate(editingInvestment.loanInterestRate?.toString() || '');
            setLoanTermYears(editingInvestment.loanTermYears?.toString() || '');
        } else {
            // Reset form when type changes
            setName('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCagr('10');
            setDownpayment('');
            setHouseCost('');
            setLoanTerm('');
            setAnnualInterestRate('');
            setLoanAmount('');
            setLoanInterestRate('');
            setLoanTermYears('');
        }
    }, [type, editingInvestment]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!isAgeSet) {
            alert('Please set your date of birth and retirement age before adding investments');
            return;
        }
        if (!name) {
            alert('Please fill in all required fields');
            return;
        }
        if (type !== 'loan' && type !== 'real-estate' && !amount) {
            alert('Please fill in all required fields');
            return;
        }
        if (type === 'real-estate') {
            if (!date || !downpayment || !houseCost || !loanTerm || !annualInterestRate) {
                alert('Please fill in all required fields for real estate investment');
                return;
            }
        }
        if (type === 'loan') {
            if (!loanAmount || !loanInterestRate || !loanTermYears || !date) {
                alert('Please fill in all required fields for loan');
                return;
            }
        }

        onSubmit({
            type,
            name,
            amount:
                type === 'loan'
                    ? 0
                    : type === 'real-estate'
                        ? parseFloat(houseCost)
                        : parseFloat(amount),
            date: type === 'real-estate' || type === 'loan' ? date : new Date().toISOString().split('T')[0],
            cagr:
                type === 'loan'
                    ? 0
                    : type === 'real-estate'
                        ? (editingInvestment?.type === 'real-estate' ? editingInvestment.cagr : 5)
                        : parseFloat(cagr),
            downpayment: type === 'real-estate' ? parseFloat(downpayment) : undefined,
            houseCost: type === 'real-estate' ? parseFloat(houseCost) : undefined,
            loanTerm: type === 'real-estate' ? parseFloat(loanTerm) : undefined,
            annualInterestRate: type === 'real-estate' ? parseFloat(annualInterestRate) : undefined,
            loanAmount: type === 'loan' ? parseFloat(loanAmount) : undefined,
            loanInterestRate: type === 'loan' ? parseFloat(loanInterestRate) : undefined,
            loanTermYears: type === 'loan' ? parseFloat(loanTermYears) : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/30 p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-2xl w-[min(92vw,42rem)] max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {editingInvestment ? 'Edit' : 'Add'} {type === 'portfolio' ? 'Portfolio' : type === 'real-estate' ? 'Real Estate' : 'Loan'} {type !== 'loan' ? 'Investment' : ''}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name / Symbol
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={
                                type === 'portfolio'
                                    ? 'e.g., AAPL, TSLA'
                                    : type === 'real-estate'
                                        ? 'e.g., Property Address'
                                        : 'e.g., Personal Loan'
                            }
                            required
                        />
                    </div>

                    {type !== 'loan' && type !== 'real-estate' && (
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                {`Current Value (${currencySymbols[currency] || currency})`}
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    )}

                    {type === 'real-estate' && (
                        <>
                            <div>
                                <label htmlFor="downpayment" className="block text-sm font-medium text-gray-700 mb-1">
                                    Downpayment ({currencySymbols[currency] || currency})
                                </label>
                                <input
                                    type="number"
                                    id="downpayment"
                                    value={downpayment}
                                    onChange={(e) => setDownpayment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="houseCost" className="block text-sm font-medium text-gray-700 mb-1">
                                    House purchase price ({currencySymbols[currency] || currency})
                                </label>
                                <input
                                    type="number"
                                    id="houseCost"
                                    value={houseCost}
                                    onChange={(e) => setHouseCost(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Purchased
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Term (Years)
                                </label>
                                <input
                                    type="number"
                                    id="loanTerm"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="30"
                                    step="1"
                                    min="1"
                                    max="50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="annualInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Annual Interest Rate (%)
                                </label>
                                <input
                                    type="number"
                                    id="annualInterestRate"
                                    value={annualInterestRate}
                                    onChange={(e) => setAnnualInterestRate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="5.0"
                                    step="0.1"
                                    min="0"
                                    max="30"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {type === 'loan' && (
                        <>
                            <div>
                                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Amount ({currencySymbols[currency] || currency})
                                </label>
                                <input
                                    type="number"
                                    id="loanAmount"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="loanInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Interest Rate (%)
                                </label>
                                <input
                                    type="number"
                                    id="loanInterestRate"
                                    value={loanInterestRate}
                                    onChange={(e) => setLoanInterestRate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="5.0"
                                    step="0.1"
                                    min="0"
                                    max="30"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="loanTermYears" className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Term (Years)
                                </label>
                                <input
                                    type="number"
                                    id="loanTermYears"
                                    value={loanTermYears}
                                    onChange={(e) => setLoanTermYears(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="5"
                                    step="1"
                                    min="1"
                                    max="50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Start Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {type !== 'portfolio' && type !== 'real-estate' && type !== 'loan' && (
                        <div>
                            <label htmlFor="cagr" className="block text-sm font-medium text-gray-700 mb-1">
                                CAGR (%)
                            </label>
                            <input
                                type="number"
                                id="cagr"
                                value={cagr}
                                onChange={(e) => setCagr(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="10"
                                step="0.1"
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${type === 'portfolio'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : type === 'real-estate'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {editingInvestment ? 'Update Investment' : 'Add Investment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

