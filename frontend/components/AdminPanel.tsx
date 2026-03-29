'use client';

import { useEffect, useState, FormEvent } from 'react';
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from '../lib/api';
import API from '../lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(0);
  const [creating, setCreating] = useState(false);


  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, auditRes] = await Promise.all([
        getInventory(),
        API.get('/audit'),
      ]);
      setInventory(invRes.data);
      setAuditLogs(auditRes.data || []);
    } catch {

      try {
        const invRes = await getInventory();
        setInventory(invRes.data);
      } catch {
        setError('Failed to load inventory.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await createInventory({ sku: newSku, name: newName, totalQuantity: newQty });
      setSuccess(`Created ${newSku} successfully!`);
      setNewSku('');
      setNewName('');
      setNewQty(0);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create inventory item');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditQty(item.totalQuantity);
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await updateInventory(id, { name: editName, totalQuantity: editQty });
      setEditId(null);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, sku: string) => {
    if (!confirm(`Delete ${sku}? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteInventory(id);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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


      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Inventory Item
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="SKU (e.g. SKU-004)"
            value={newSku}
            onChange={(e) => setNewSku(e.target.value)}
            required
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <input
            type="text"
            placeholder="Product name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <input
            type="number"
            placeholder="Quantity"
            min={0}
            value={newQty}
            onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
            required
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={creating}
            className="py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-600/20"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>


      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Inventory Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-gray-400 font-medium">SKU</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Name</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium">Total</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium">Reserved</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium">Available</th>
                <th className="text-center px-6 py-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono text-brand-400 text-xs bg-brand-900/20 px-2 py-1 rounded">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editId === item.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    ) : (
                      <span className="text-white">{item.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        min={item.reservedQuantity}
                        value={editQty}
                        onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    ) : (
                      <span className="text-gray-300">{item.totalQuantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-yellow-400">{item.reservedQuantity}</td>
                  <td className="px-6 py-4 text-right text-green-400">{item.availableQuantity}</td>
                  <td className="px-6 py-4 text-center">
                    {editId === item.id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleSave(item.id)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition"
                        >
                          {saving ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.sku)}
                          className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-400 text-xs font-medium rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Audit Logs</h2>
        </div>
        <div className="overflow-x-auto">
          {auditLogs.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Action</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Entity</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-3 font-mono text-xs text-brand-300">{log.action}</td>
                    <td className="px-6 py-3 text-gray-300 text-xs">{log.entityType} / {log.entityId}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              No audit logs found yet. Actions taken in the system will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
