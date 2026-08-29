import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import { StaffForm } from '../../components/staff/StaffForm';
import { ActiveStaffPanel } from '../../components/staff/ActiveStaffPanel';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import { User, Role } from '../../types/user.types';
import { getErrorMessage } from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';

async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get('/users');
  return data.data;
}

async function updateUserRequest(id: string, payload: Partial<{ fullName: string; role: Role; isActive: boolean }>) {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data.data as User;
}

async function registerStaffRequest(payload: { fullName: string; email: string; password: string; role: Role }) {
  const { data } = await api.post('/auth/register', payload);
  return data.data as User;
}

async function deactivateUserRequest(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data.data as User;
}

type SortKey = 'fullName' | 'email' | 'createdAt';
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function ActionsMenu({
  user,
  isSelf,
  onEdit,
  onToggleActive,
  onDeleteAttempt,
}: {
  user: User;
  isSelf: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDeleteAttempt: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-50 w-44 rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <p className="px-3 pb-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">Actions</p>

          <button
            type="button"
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Pencil className="h-4 w-4 text-gray-400" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleActive();
              setIsOpen(false);
            }}
            disabled={isSelf}
            title={isSelf ? "You can't block your own account" : undefined}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {user.isActive ? (
              <Ban className="h-4 w-4 text-gray-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
            )}
            {user.isActive ? 'Block' : 'Unblock'}
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          <button
            type="button"
            onClick={() => {
              onDeleteAttempt();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function StaffManagementPage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [deleteAttemptUser, setDeleteAttemptUser] = useState<User | undefined>(undefined);

  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }

  const createMutation = useMutation({
    mutationFn: registerStaffRequest,
    onSuccess: () => {
      invalidate();
      showToast('Staff account created');
      setIsFormOpen(false);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ fullName: string; role: Role }> }) =>
      updateUserRequest(id, payload),
    onSuccess: () => {
      invalidate();
      showToast('Staff account updated');
      setIsFormOpen(false);
      setEditingUser(undefined);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ user }: { user: User }) =>
      user.isActive ? deactivateUserRequest(user.id) : updateUserRequest(user.id, { isActive: true }),
    onSuccess: (_data, variables) => {
      invalidate();
      showToast(variables.user.isActive ? 'Account blocked' : 'Account unblocked');
      setDeleteAttemptUser(undefined);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  function handleSubmit(payload: { fullName?: string; email?: string; password?: string; role?: Role }) {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, payload: { fullName: payload.fullName, role: payload.role } });
    } else {
      createMutation.mutate(payload as { fullName: string; email: string; password: string; role: Role });
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = usersQuery.data ?? [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const diff = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? diff : -diff;
    });

    return result;
  }, [usersQuery.data, search, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredAndSorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (usersQuery.isLoading) {
    return <Loader label="Loading staff..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Users</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Dashboard &gt; Users Accounts</p>
      </div>

      <ActiveStaffPanel />

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex flex-1 min-w-[240px] items-center gap-2">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Filter
            </button>
          </div>

          <button
            onClick={() => {
              setEditingUser(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <UserPlus className="h-4 w-4" />
            Create New
          </button>
        </div>

        {/* NOTE: no overflow-x-auto wrapper here anymore. That wrapper was
            the actual bug — setting overflow-x: auto forces the browser to
            also treat overflow-y as auto/clipped on the same element (this
            is standard CSS behavior, not a Tailwind quirk), which silently
            cut off the absolutely-positioned Actions dropdown any time it
            tried to render below a row. The table's five columns are narrow
            enough not to need horizontal scrolling on realistic screen
            widths, so removing this wrapper has no visual downside and
            fully fixes the dropdown. */}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
              <th className="px-4 py-3 font-medium">
                <button onClick={() => toggleSort('fullName')} className="flex items-center gap-1 hover:text-gray-600">
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button onClick={() => toggleSort('email')} className="flex items-center gap-1 hover:text-gray-600">
                  Email
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-600">
                  Created At
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  No Results
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {user.fullName} {isSelf && <span className="text-xs text-gray-400">(You)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-1 text-xs font-medium',
                          user.isActive
                            ? 'bg-success/10 text-success'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                        )}
                      >
                        {user.isActive ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                      {user.createdAt ? formatDate(user.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ActionsMenu
                        user={user}
                        isSelf={isSelf}
                        onEdit={() => {
                          setEditingUser(user);
                          setIsFormOpen(true);
                        }}
                        onToggleActive={() => toggleActiveMutation.mutate({ user })}
                        onDeleteAttempt={() => setDeleteAttemptUser(user)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total {filteredAndSorted.length} rows.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              Rows per page
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(undefined);
        }}
        title={editingUser ? 'Edit Staff Account' : 'Add Staff Account'}
      >
        <StaffForm
          initialUser={editingUser}
          isSelf={editingUser?.id === currentUser?.id}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!deleteAttemptUser}
        onClose={() => setDeleteAttemptUser(undefined)}
        title="Can't permanently delete this account"
      >
        {deleteAttemptUser && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>{deleteAttemptUser.fullName}</strong>'s account can't be permanently deleted,
              because staff accounts are linked to real order, payment, and audit history — removing
              the account would break that history rather than just hiding it.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Blocking the account has the same practical effect: they immediately lose the ability
              to log in, while all past records stay intact for reporting and audit purposes.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteAttemptUser(undefined)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <Button
                variant="danger"
                onClick={() => toggleActiveMutation.mutate({ user: deleteAttemptUser })}
                isLoading={toggleActiveMutation.isPending}
                disabled={deleteAttemptUser.id === currentUser?.id}
              >
                Block Instead
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}