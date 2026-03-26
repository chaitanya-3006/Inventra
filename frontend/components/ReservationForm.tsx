'use client';

import { useState, FormEvent } from 'react';
import { createReservation } from '../lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  availableQuantity: number;
}

interface Props {
  inventory: InventoryItem[];
  onSuccess: () => void;
}

export default function ReservationForm({ inventory, onSuccess }: Props) {
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedItem = inventory.find((i) => i.id === inventoryId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inventoryId) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createReservation(inventoryId, quantity);
      setSuccess('Reservation created! You have 15 minutes to confirm it.');
      setInventoryId('');
      setQuantity(1);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        New Reservation
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Item</label>
          <select
            value={inventoryId}
            onChange={(e) => setInventoryId(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          >
            <option value="">Choose inventory item...</option>
            {inventory.map((item) => (
              <option key={item.id} value={item.id} disabled={item.availableQuantity === 0}>
                {item.sku} — {item.name} ({item.availableQuantity} available)
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-sm text-gray-300">
            <span className="text-gray-400">Available: </span>
            <span className={`font-semibold ${selectedItem.availableQuantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selectedItem.availableQuantity}
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
          <input
            type="number"
            min={1}
            max={selectedItem?.availableQuantity || undefined}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-3 text-green-300 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !inventoryId}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Reserving...
            </span>
          ) : 'Reserve'}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
        ⏱ Reservations expire after 15 minutes if not confirmed.
      </div>
    </div>
  );
}
