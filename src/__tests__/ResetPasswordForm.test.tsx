import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { vi } from 'vitest';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

const mockReset = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
 vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { resetPasswordForEmail: mockReset } }
}));

describe('ResetPasswordForm', () => {
  it('submits reset request', async () => {
    const onCancel = vi.fn();
    render(<ResetPasswordForm onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
     expect(mockReset).toHaveBeenCalled();
    });
  });

  it('calls onCancel when clicking retour', () => {
    const onCancel = vi.fn();
    render(<ResetPasswordForm onCancel={onCancel} />);
    fireEvent.click(screen.getByText(/retour à la connexion/i));
    expect(onCancel).toHaveBeenCalled();
  });
});

