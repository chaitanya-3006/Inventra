'use client';

import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function SearchBar({ 
  placeholder = 'Search...', 
  onChange, 
  value = '' 
}: SearchBarProps) {
  return (
    <div className="relative w-64">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
      />
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M15 11a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      </div>
    </div>
  );
}