import { render, screen, waitFor } from '@testing-library/react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => {
  const notifications = [
    { id: '1', title: 'Test', message: 'Hello world', is_read: false }
  ];
  const orderMock = vi.fn().mockResolvedValue({ data: notifications, error: null });
  const selectEqMock = vi.fn(() => ({ order: orderMock }));
  const selectMock = vi.fn(() => ({ eq: selectEqMock }));
  const updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const updateMock = vi.fn(() => ({ eq: updateEqMock }));
  const fromMock = vi.fn(() => ({ select: selectMock, update: updateMock }));
  return { supabase: { from: fromMock } };
});
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, loading: false })
}));

describe('NotificationCenter', () => {
  it('renders a notification', async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });
});
