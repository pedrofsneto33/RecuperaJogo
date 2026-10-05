import { getRequest } from "@tanstack/react-start/server";

export function clientIp(): string | null {
  try {
    const request = getRequest();
    if (!request) return null;
    const xf = request.headers.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || null;
    return request.headers.get("x-real-ip");
  } catch {
    return null;
  }
}
