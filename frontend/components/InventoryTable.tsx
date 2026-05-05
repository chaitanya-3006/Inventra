'use client';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
  updatedAt: string;
}

interface Props {
  items: InventoryItem[];
  onReserve: (item: InventoryItem) => void;
  onUpdate?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  isAdmin?: boolean;
}

export default function InventoryTable({ items, onReserve, onUpdate, onDelete, isAdmin = false }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-400">No inventory items found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50 text-left text-gray-400 text-sm">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Item Name</th>
              <th className="px-4 py-3 font-medium text-right">Total Qty</th>
              <th className="px-4 py-3 font-medium text-right">Reserved</th>
              <th className="px-4 py-3 font-medium text-right">Available</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Last Updated</th>
              <th className="px-4 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-800/30 transition">
                <td className="px-4 py-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-500">No Img</div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-white font-medium">{item.sku}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-gray-300">{item.name}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-gray-300">{item.totalQuantity}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-yellow-400">{item.reservedQuantity}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-medium ${item.availableQuantity > 10 ? 'text-green-400' : item.availableQuantity > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {item.availableQuantity}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.availableQuantity > 10 ? 'bg-green-900/50 text-green-400' :
                    item.availableQuantity > 0 ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {item.availableQuantity > 10 ? 'In Stock' : item.availableQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-gray-500 text-sm">
                    {new Date(item.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {isAdmin ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onUpdate && onUpdate(item)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-lg transition"
                      >
                        Update Stock
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(item)}
                        className="p-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition"
                        title="Delete Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onReserve(item)}
                      disabled={item.availableQuantity === 0}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition"
                    >
                      Reserve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
