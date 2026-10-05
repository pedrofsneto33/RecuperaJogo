import { isOwnerEmail } from "@/lib/empresa";

export type Role = "OWNER" | "CLIENT";

export function roleFromEmail(email?: string | null): Role {
  return isOwnerEmail(email) ? "OWNER" : "CLIENT";
}

export function assertOwnerEmail(email?: string | null): void {
  if (!isOwnerEmail(email)) {
    throw new Error("FORBIDDEN_OWNER");
  }
}
