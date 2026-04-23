'use client';

import { useState, FormEvent } from 'react';
import { createReservation } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Box, Loader2, CheckCircle2 } from 'lucide-react';

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

interface Selection {
  inventoryId: string;
  quantity: number | '';
  id: string; // unique ID for framer-motion AnimatePresence
}

export default function ReservationForm({ inventory, onSuccess }: Props) {
  const [selections, setSelections] = useState<Selection[]>([{ inventoryId: '', quantity: 1, id: Date.now().toString() }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddMore = () => {
    setSelections([...selections, { inventoryId: '', quantity: 1, id: Date.now().toString() }]);
  };

  const handleRemove = (id: string) => {
    setSelections(selections.filter(s => s.id !== id));
  };

  const updateSelection = (id: string, field: keyof Selection, value: string | number) => {
    setSelections(selections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validSelections = selections.filter((s) => s.inventoryId && s.quantity);
    if (validSelections.length === 0) {
      setError('Please select at least one item and quantity.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await Promise.all(
        validSelections.map((sel) => {
          const finalQuantity = typeof sel.quantity === 'number' ? sel.quantity : 1;
          return createReservation(sel.inventoryId, finalQuantity);
        })
      );
      setSuccess('Reservations created successfully and instantly confirmed!');
      setTimeout(() => {
        setSelections([{ inventoryId: '', quantity: 1, id: Date.now().toString() }]);
        setSuccess('');
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f0f11] border border-gray-800/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] pointer-events-none" />

      <h2 className="text-white font-semibold text-lg mb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
            <Box className="w-5 h-5" />
          </div>
          New Reservation Request
        </div>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {selections.map((selection, index) => {
            const selectedItem = inventory.find((i) => i.id === selection.inventoryId);
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                key={selection.id} 
                className="group space-y-4 p-5 bg-gray-900/50 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700/80 rounded-2xl relative transition-all duration-300"
              >
                {selections.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => handleRemove(selection.id)}
                    className="absolute top-4 right-4 p-1 text-gray-500 hover:text-red-400 bg-gray-900 rounded-full border border-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Item</label>
                    <select
                      value={selection.inventoryId}
                      onChange={(e) => updateSelection(selection.id, 'inventoryId', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choose inventory item...</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id} disabled={item.availableQuantity === 0}>
                          {item.sku} — {item.name} ({item.availableQuantity} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedItem?.availableQuantity || undefined}
                      value={selection.quantity === '' ? '' : selection.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateSelection(selection.id, 'quantity', val === '' ? '' : parseInt(val, 10));
                      }}
                      required
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Progress bar visualizing stock level */}
                {selectedItem && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Available Stock</span>
                      <span className={`font-semibold ${selectedItem.availableQuantity > 10 ? 'text-green-400' : 'text-orange-400'}`}>
                        {selectedItem.availableQuantity} units
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (selectedItem.availableQuantity / 100) * 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${selectedItem.availableQuantity > 10 ? 'bg-green-500' : 'bg-orange-500'}`}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleAddMore}
          className="w-full py-3 px-4 border border-dashed border-gray-700/60 hover:border-brand-500/50 hover:bg-brand-500/5 text-gray-400 hover:text-brand-300 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Another Item
        </motion.button>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !selections.some((s) => s.inventoryId)}
          className="w-full relative group overflow-hidden py-4 px-4 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
          
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : 'Reserve All Items'}
        </motion.button>
      </form>
    </motion.div>
  );
}
