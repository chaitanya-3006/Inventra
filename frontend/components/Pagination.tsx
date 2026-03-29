'use client';

import { useMemo } from 'react';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalItems, 
  rowsPerPage, 
  onPageChange 
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // Function to calculate which page numbers to display
  const getPageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // If current page is among the first 3 pages
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    // If current page is among the last 3 pages
    if (currentPage >= totalPages - 2) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }

    // Otherwise, show first, last, and surrounding pages
    return [
      1,
      '...',
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      '...',
      totalPages
    ];
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages === 1) {
    return null; // No pagination needed if only one page
  }

  return (
    <div className="flex items-center justify-between px-4 pt-4 border-t border-gray-800">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <select
          value={rowsPerPage}
          onChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value);
            // Reset to first page when changing rows per page
            onPageChange(1);
            // Note: The parent should handle updating rowsPerPage state
            // We're only triggering a page change to 1 here
          }}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-gray-300"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span> rows per page</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
        >
          Previous
        </button>
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers.map((pn) => (
            <React.Fragment key={pn}>
              {pn === '...' ? (
                <span className="text-gray-400 px-2">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(pn as number)}
                  className={`px-3 py-1 rounded ${
                    pn === currentPage
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {pn}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="ml-2 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}