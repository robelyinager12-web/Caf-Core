import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { api } from '../../services/api';
import { StaffTable } from '../../components/staff/StaffTable';
import { StaffForm } from '../../components/staff/StaffForm';
import { ActiveStaffPanel } from '../../components/staff/ActiveStaffPanel';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import { User, Role } from '../../types/user.types';
import { getErrorMessage } from '../../utils/validators';

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

export function StaffManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

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
    onSuccess: () => {
      invalidate();
      showToast('Staff status updated');
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

  if (usersQuery.isLoading) {
    return <Loader label="Loading staff..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Staff Management</h1>
        <Button
          onClick={() => {
            setEditingUser(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <ActiveStaffPanel />

      <StaffTable
        users={usersQuery.data ?? []}
        currentUserId={currentUser?.id}
        onEdit={(user) => {
          setEditingUser(user);
          setIsFormOpen(true);
        }}
        onToggleActive={(user) => toggleActiveMutation.mutate({ user })}
      />

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
    </div>
  );
}