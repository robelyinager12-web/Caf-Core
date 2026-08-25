import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { getAuditLogs, getAuditActions } from '../../services/auditService';
import { Loader } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatDate';

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return '-';
  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(', ');
}

export function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const actionsQuery = useQuery({ queryKey: ['audit-actions'], queryFn: getAuditActions });

  const logsQuery = useQuery({
    queryKey: ['audit-logs', actionFilter, entityTypeFilter],
    queryFn: () =>
      getAuditLogs({
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        limit: 100,
      }),
  });

  const entityTypes = Array.from(
    new Set((logsQuery.data ?? []).map((log) => log.entityType))
  ).sort();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-primary-600" />
        <h1 className="text-xl font-semibold text-gray-900">Audit Log</h1>
      </div>
      <p className="-mt-2 text-sm text-gray-500">
        A complete record of sensitive actions across the system. Visible to Admin only.
      </p>

      <div className="flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          {(actionsQuery.data ?? []).map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        <select
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Entity Types</option>
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {logsQuery.isLoading ? (
        <Loader label="Loading audit trail..." />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Performed By</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Entity</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(logsQuery.data ?? []).map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {log.user ? (
                      <>
                        {log.user.fullName}{' '}
                        <span className="text-xs text-gray-400">({log.user.role})</span>
                      </>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                  <td className="max-w-md truncate px-4 py-3 text-xs text-gray-500" title={formatMetadata(log.metadata)}>
                    {formatMetadata(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(logsQuery.data ?? []).length === 0 && (
            <p className="py-12 text-center text-sm text-gray-500">No audit entries match this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}