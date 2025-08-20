import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';
import { vi } from 'vitest';
import { describe } from 'node:test';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn()})
}));

const mockSignIn = vi.fn().mockResolvedValue({ data: {}, error: null });
vi.mock('@/hooks/use-toast', () => ({
    supabase: { auth: { signInWithPassword: mockSignIn }}
}));

describe('LoginForm', () => {
    it('submits credentials', async () => {
        const onToggleMode = vi.fn();
        const onToggleReset = vi.fn();
        render(<LoginForm onToggleMode={onToggleMode} onToggleReset={onToggleReset} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                email: 'test@example.com', password: 'password' });
        });
    });
    it('triggers toggle handlers', () => {
        const onToggleMode = vi.fn();
        const onToggleReset = vi.fn();
        render(<LoginForm onToggleMode={onToggleMode} onToggleReset={onToggleReset} />);

        fireEvent.click(screen.getByText(/s'inscrire/i));
        expect(onToggleMode).toHaveBeenCalled();

        fireEvent.click(screen.getByText(/mot de passe oublié\?/i));
        expect(onToggleReset).toHaveBeenCalled();
    });
});