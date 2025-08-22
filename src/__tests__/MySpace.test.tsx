import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MySpace from '@/pages/my-space';
import { vi } from 'vitest';

vi.mock('@/components/Header', () => ({ default: () => <div>Header</div> }));
vi.mock('@/components/Footer', () => ({ default: () => <div>Footer</div> }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: '123' }, loading: false })
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

var mockUpload: any;
var mockUpdate: any;
var mockUpdateEq: any;
var mockFrom: any;
var mockSelect: any;
var mockEqSelect: any;
var mockSingle: any;
var mockGetPublicUrl: any;
var mockStorageFrom: any;

vi.mock('@/integrations/supabase/client', () => {
  mockUpload = vi.fn().mockResolvedValue({ data: {}, error: null });
  mockGetPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.png' } }));
  mockStorageFrom = vi.fn(() => ({ upload: mockUpload, getPublicUrl: mockGetPublicUrl }));

  mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
  mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
  mockSingle = vi.fn().mockResolvedValue({ data: { first_name: '', last_name: '', city: '', country: '', personal_description: '', avatar_url: null }, error: null });
  mockEqSelect = vi.fn(() => ({ single: mockSingle }));
  mockSelect = vi.fn(() => ({ eq: mockEqSelect }));
  mockFrom = vi.fn(() => ({ select: mockSelect, update: mockUpdate }));

  return {
    supabase: {
      from: mockFrom,
      storage: { from: mockStorageFrom },
    },
  };
});

describe('MySpace avatar upload', () => {
  it('uploads new avatar and updates profile', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MySpace />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = await screen.findByLabelText(/avatar/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: 'https://example.com/avatar.png' });
    });
  });
});
