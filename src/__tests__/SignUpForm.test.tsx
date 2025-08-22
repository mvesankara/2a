
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from '@/components/auth/SignUpForm';
import { vi } from 'vitest';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));
 

const mockSignUp = vi.fn().mockResolvedValue({
  data: { user: { id: '1', email: 'test@example.com' } },
  error: null,
});
const mockResend = vi.fn().mockResolvedValue({});
const mockInsert = vi.fn().mockResolvedValue({});
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { signUp: mockSignUp, resend: mockResend }, from: mockFrom }
}));

describe('SignUpForm', () => {
  it('submits sign up data', async () => {
    const onToggleMode = vi.fn();
    render(<SignUpForm onToggleMode={onToggleMode} />);

    fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
      expect(mockResend).toHaveBeenCalledWith({ type: 'signup', email: 'test@example.com' });
    });
    expect(onToggleMode).toHaveBeenCalled();
  });
});
