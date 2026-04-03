import { AuthProvider } from "@/lib/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
