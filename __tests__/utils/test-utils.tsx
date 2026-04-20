import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AuthProvider } from "@/lib/context/auth-context";

/**
 * Custom render function that wraps components with necessary providers
 * Use this instead of render() from @testing-library/react in tests
 */
export function renderWithProviders(
  ui: ReactElement,
  { ...renderOptions }: Omit<RenderOptions, "wrapper"> = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// But override render with our custom one
export { renderWithProviders as render };
