'use client';

import { useState } from 'react';
import { Moon, Sun, Plus, Wallet } from 'lucide-react';
import SubmitModal from './SubmitModal';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function Header({ isDarkMode, setIsDarkMode }: HeaderProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Habiki
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Decentralized News Platform
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Submit Story Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Submit Story</span>
            </button>

            {/* Wallet Connection */}
            <button
              onClick={() => setIsWalletConnected(!isWalletConnected)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                isWalletConnected
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">
                {isWalletConnected ? 'Connected' : 'Connect Wallet'}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? (
                <Sun size={16} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon size={16} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitModal onClose={() => setShowSubmitModal(false)} />
      )}
    </>
  );
} 