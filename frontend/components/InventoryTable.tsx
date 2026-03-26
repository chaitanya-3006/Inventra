'use client';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

interface Props {
  items: InventoryItem[];
}

export default function InventoryTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-gray-400">No inventory items found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-4 text-gray-400 font-medium">SKU</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Name</th>
              <th className="text-right px-6 py-4 text-gray-400 font-medium">Total</th>
              <th className="text-right px-6 py-4 text-gray-400 font-medium">Reserved</th>
              <th className="text-right px-6 py-4 text-gray-400 font-medium">Available</th>
              <th className="text-center px-6 py-4 text-gray-400 font-medium">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map((item) => {
              const pct = item.totalQuantity > 0
                ? Math.round((item.availableQuantity / item.totalQuantity) * 100)
                : 0;
              const barColor = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';

              return (
                <tr key={item.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono text-brand-400 text-xs bg-brand-900/20 px-2 py-1 rounded">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-right text-gray-300">
                    {item.totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`${item.reservedQuantity > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {item.reservedQuantity.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${pct > 50 ? 'text-green-400' : pct > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {item.availableQuantity.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className={`${barColor} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-9 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
