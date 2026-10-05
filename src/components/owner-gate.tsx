import { Navigate } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isOwnerEmail } from "@/lib/empresa";

export function OwnerGate({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="campaign grid min-h-screen place-items-center bg-bg text-fg">
        <div className="h-8 w-24 animate-pulse rounded-md bg-border" aria-hidden />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!isOwnerEmail(user.primaryEmail)) return <Navigate to="/acesso-negado" />;
  return <>{children}</>;
}
