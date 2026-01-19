'use client';

import { useState, useEffect } from 'react';
import { loadFromCookie, saveToCookie } from '../utils/cookies';

interface WelcomeGuideProps {
    isOpen?: boolean;
    onClose?: () => void;
    showOnFirstVisit?: boolean;
}

export default function WelcomeGuide({ isOpen: externalIsOpen, onClose: externalOnClose, showOnFirstVisit = true }: WelcomeGuideProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    useEffect(() => {
        if (showOnFirstVisit) {
            // Check if user has seen the guide before
            const hasSeenGuide = loadFromCookie<boolean>('paisa_hasSeenGuide', false);
            if (!hasSeenGuide) {
                setInternalIsOpen(true);
            }
        }
    }, [showOnFirstVisit]);

    // Use external control if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    const handleClose = () => {
        if (externalOnClose) {
            externalOnClose();
        } else {
            setInternalIsOpen(false);
        }
        if (showOnFirstVisit) {
            saveToCookie('paisa_hasSeenGuide', true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome to Asset Calculator!</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-6 space-y-6">
                    <div className="text-gray-700">
                        <p className="text-lg mb-4">
                            Get started by following these simple steps to track your investments and plan for retirement:
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Set Your Date of Birth</h3>
                                <p className="text-gray-600 text-sm">
                                    Enter your date of birth in the right panel. This helps calculate your current age and years until retirement.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Adjust Your Retirement Age</h3>
                                <p className="text-gray-600 text-sm">
                                    Use the slider in the right panel to set your desired retirement age. The large number shows your selected age, and you can drag the slider to adjust it.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Select Currency & Inflation</h3>
                                <p className="text-gray-600 text-sm">
                                    Choose your preferred currency and set the expected inflation rate. These settings affect how all values are displayed and calculated.
                                </p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                4
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Add Your Investments</h3>
                                <p className="text-gray-600 text-sm">
                                    Click the buttons in the left sidebar to add different types of investments:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li><strong>Portfolio Investment:</strong> Stocks, ETFs, mutual funds</li>
                                        <li><strong>Real Estate Investment:</strong> Properties with mortgage details</li>
                                        <li><strong>Loan:</strong> Personal loans or other liabilities</li>
                                    </ul>
                                </p>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                5
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Adjust CAGR (Growth Rate)</h3>
                                <p className="text-gray-600 text-sm">
                                    For each investment, use the <strong>+</strong> and <strong>−</strong> buttons to adjust the expected annual growth rate (CAGR). This affects how your investments are projected to grow over time.
                                </p>
                            </div>
                        </div>

                        {/* Step 6 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                6
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">View Your Projections</h3>
                                <p className="text-gray-600 text-sm">
                                    Check the top-left panel to see your projected portfolio value at retirement, adjusted for inflation, and total liabilities. These update automatically as you make changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-sm text-blue-900">
                            <strong>💡 Tip:</strong> All your data is automatically saved in cookies, so you can close the browser and return later to find everything exactly as you left it!
                        </p>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}
