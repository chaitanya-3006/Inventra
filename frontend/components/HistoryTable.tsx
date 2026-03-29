'use client';

interface HistoryItem {
  id: string;
  sku: string;
  operator: { id: string; name: string; avatar: string };
  items: Array<{ name: string; quantity: number }>;
  requestedAt: string;
  status: 'Confirmed' | 'Expired' | 'Cancelled';
}

interface Props {
  items: HistoryItem[];
}

export default function HistoryTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-400">No history records found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50 text-left text-gray-400 text-sm">
              <th className="px-4 py-3 font-medium">Reservation ID</th>
              <th className="px-4 py-3 font-medium">Operator</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Requested At</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-800/30 transition">
                <td className="px-4 py-4">
                  <span className="text-white font-medium">{item.sku}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
                      {item.operator.avatar}
                    </div>
                    <span className="text-gray-300">{item.operator.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-gray-300">
                    {item.items.map((i, idx) => (
                      <div key={idx}>
                        <span className="text-white">{i.name}</span>
                        <span className="text-gray-500 ml-1">x{i.quantity}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-gray-400 text-sm">
                    {new Date(item.requestedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'Confirmed' ? 'bg-green-900/50 text-green-400' :
                    item.status === 'Expired' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
