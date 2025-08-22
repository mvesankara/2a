 import { render, screen, fireEvent, waitFor } from '@testing-library/react';
 import LoginForm from '@/components/auth/LoginForm';
 import { vi } from 'vitest';
 import { describe } from 'node:test';
 import { MemoryRouter } from 'react-router-dom';
 
 vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
 }));
 

const mockSignIn = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {}, error: null })
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { signInWithPassword: mockSignIn } }
 }));
 
 describe('LoginForm', () => {
     it('submits credentials', async () => {
         const onToggleMode = vi.fn();
         const onToggleReset = vi.fn();

        render(
          <MemoryRouter>
            <LoginForm onToggleMode={onToggleMode} onToggleReset={onToggleReset} />
          </MemoryRouter>
        );
 
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
 
         await waitFor(() => {
             expect(mockSignIn).toHaveBeenCalledWith({
                 email: 'test@example.com', password: 'password' });
         });
     });
     it('triggers toggle handlers', () => {
         const onToggleMode = vi.fn();
         const onToggleReset = vi.fn();

        render(
          <MemoryRouter>
            <LoginForm onToggleMode={onToggleMode} onToggleReset={onToggleReset} />
          </MemoryRouter>
        );
 
         fireEvent.click(screen.getByText(/s'inscrire/i));
         expect(onToggleMode).toHaveBeenCalled();
 
        fireEvent.click(screen.getByRole('button', { name: /mot de passe oublié/i }));
         expect(onToggleReset).toHaveBeenCalled();
     });
 });
