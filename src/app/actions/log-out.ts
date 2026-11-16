"use server";

import { authServiceForRequest } from "@/lib/auth/next-cookie-jar";

export async function logOut(): Promise<void> {
  const service = await authServiceForRequest();
  await service.signOut();
}
