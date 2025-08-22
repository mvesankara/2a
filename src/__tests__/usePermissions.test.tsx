import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/types/roles";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "1" } }),
}));

const mockSingle = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ single: mockSingle }),
      }),
    }),
  },
}));

describe("usePermissions", () => {
  beforeEach(() => {
    mockSingle.mockReset();
  });

  it("grants all permissions to admin", async () => {
    mockSingle.mockReturnValue({ data: { role: UserRole.ADMIN }, error: null });
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasRole(UserRole.ADMIN)).toBe(true);
    expect(result.current.hasPermission("any")).toBe(true);
  });

  it("denies permissions for members", async () => {
    mockSingle.mockReturnValue({ data: { role: UserRole.MEMBER }, error: null });
    const { result } = renderHook(() => usePermissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
    expect(result.current.hasPermission("any")).toBe(false);
  });
});
