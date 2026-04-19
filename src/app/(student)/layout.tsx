import { AuthProvider } from "@/lib/context/auth-context";

// providing the context state to the children
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
