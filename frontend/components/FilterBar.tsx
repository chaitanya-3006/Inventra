'use client';

import { useState } from 'react';

interface FilterBarProps {
  filters: {
    status: string;
    operator: string;
    startDate: string;
    endDate: string;
    searchTerm: string;
  };
  onFiltersChange: (value: React.SetStateAction<{
    status: string;
    operator: string;
    startDate: string;
    endDate: string;
    searchTerm: string;
  }>) => void;
  onReset?: () => void;
  operators?: string[];
}

export default function FilterBar({ 
  filters, 
  onFiltersChange,
  onReset,
  operators = ['All Operators']
}: FilterBarProps) {
  const [statusOptions] = useState([
    'All Status',
    'Confirmed',
    'Expired',
    'Cancelled'
  ]);

  const operatorOptions = ['All Operators', ...operators];

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange((prev) => ({ ...prev, status: e.target.value }));
    };

    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange((prev) => ({ ...prev, operator: e.target.value }));
    };

  const handleDateChange = (type: 'start' | 'end', date: string) => {
    onFiltersChange(prev => ({ 
      ...prev, 
      [type === 'start' ? 'startDate' : 'endDate']: date 
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleReset = () => {
    onFiltersChange({
      status: 'All Status',
      operator: 'All Operators',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    if (onReset) onReset();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Operator</label>
          <select
            value={filters.operator}
            onChange={handleOperatorChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
          >
            {operatorOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
            />
          </div>
        </div>

        {/* Search */}
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Search ID or SKU</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
            />
            {onReset && (
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Apply Button (full width on mobile) */}
        <div className="col-span-1 lg:col-span-4 flex justify-end">
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}