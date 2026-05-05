'use client';

interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any; // We'll simplify for display
  newValue: any; // We'll simplify for display
  ipAddress: string;
  createdAt: string; // ISO timestamp
}

interface Props {
  items: AuditLogItem[];
}

export default function AuditLogTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.504-.113-2.995-.33-4.38z" />
          </svg>
        </div>
        <p className="text-gray-400">No audit log entries found</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Simplify the oldValue and newValue for display
  const getDetails = (action: string, entityType: string, entityId: string, oldValue: any, newValue: any) => {
    if (action === 'Item Added') {
      return `Added ${entityType} (ID: ${entityId}): ${newValue?.name || ''} (SKU: ${newValue?.sku || ''}, Qty: ${newValue?.totalQuantity || ''})`;
    }
    if (action === 'Item Deleted') {
      return `Deleted ${entityType} (ID: ${entityId}): ${oldValue?.name || ''} (SKU: ${oldValue?.sku || ''})`;
    }
    if (action === 'Item Updated') {
      const changes = [];
      if (oldValue?.name !== newValue?.name) changes.push(`Name: ${oldValue?.name || 'N/A'} -> ${newValue?.name || 'N/A'}`);
      if (oldValue?.totalQuantity !== newValue?.totalQuantity) changes.push(`Qty: ${oldValue?.totalQuantity || 'N/A'} -> ${newValue?.totalQuantity || 'N/A'}`);
      return `Updated ${entityType} (ID: ${entityId}). Changes: ${changes.join(', ')}`;
    }
    if (action === 'Reservation Auto-Confirmed') {
      return `Auto-Confirmed reservation (ID: ${entityId}) for ${newValue?.quantity || 'N/A'} units`;
    }
    if (action === 'Reservation Updated') {
      return `Updated reservation (ID: ${entityId}) status to ${newValue?.status || ''}`;
    }
    if (action === 'Reservation Canceled') {
      return `Canceled reservation (ID: ${entityId})`;
    }
    return `${action} on ${entityType} (ID: ${entityId})`;
  };

  const getActionBadge = (action: string) => {
    // Define colors for different actions
    const actionColors: Record<string, { bg: string; text: string }> = {
      'Item Added': { bg: 'bg-green-100', text: 'text-green-800' },
      'Item Deleted': { bg: 'bg-red-100', text: 'text-red-800' },
      'Item Updated': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Reservation Created': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Reservation Canceled': { bg: 'bg-orange-100', text: 'text-orange-800' },
      // Default
      default: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const color = actionColors[action] || actionColors.default;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text}`}>{action}</span>;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">Date & Time</th>
              <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">User</th>
              <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">Action</th>
              <th className="text-left px-6 py-3 text-gray-400 font-medium text-xs">Details</th>
              <th className="text-center px-6 py-3 text-gray-400 font-medium text-xs">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/50 transition">
                <td className="px-6 py-3 text-center text-gray-300">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-6 py-3 text-left flex items-center gap-3">
                  {/* Avatar - using initials for now */}
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
                    {log.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{log.userName}</p>
                    <p className="text-gray-400 text-xs">{log.userRole}</p>
                  </div>
                </td>
                <td className="px-6 py-3 text-center">
                  {getActionBadge(log.action)}
                </td>
                <td className="px-6 py-3 text-left text-gray-300">
                  {getDetails(log.action, log.entityType, log.entityId, log.oldValue, log.newValue)}
                </td>
                <td className="px-6 py-3 text-center text-gray-300">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}