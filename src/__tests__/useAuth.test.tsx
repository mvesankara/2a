import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { vi } from 'vitest';

const user = { id: '1', email: 'test@example.com' } as any;
const session = { user } as any;

const mockGetSession = vi.fn().mockResolvedValue({ data: { session }, error: null });
const mockOnAuthStateChange = vi.fn((cb: any) => {
  cb('SIGNED_IN', session);
  return { data: { subscription: { unsubscribe: vi.fn() } } };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

function TestComponent() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? user.email : 'no-user'}</div>;
}

describe('useAuth', () => {
  it('provides user from supabase', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
