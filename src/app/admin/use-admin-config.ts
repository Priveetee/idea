"use client";

import { trpc } from "@/lib/trpc";

function isUnauthorizedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const e = err as {
    message?: unknown;
    data?: unknown;
    shape?: unknown;
  };

  if (typeof e.message === "string" && e.message.includes("UNAUTHORIZED")) {
    return true;
  }

  const data = e.data as { code?: unknown } | undefined;
  if (data && typeof data.code === "string" && data.code === "UNAUTHORIZED") {
    return true;
  }

  const shape = e.shape as { message?: unknown } | undefined;
  if (
    shape &&
    typeof shape.message === "string" &&
    shape.message.includes("UNAUTHORIZED")
  ) {
    return true;
  }

  return false;
}

export function useAdminConfig() {
  const { data, isLoading, error } = trpc.config.get.useQuery();
  const setRegistrationsOpen = trpc.config.setRegistrationsOpen.useMutation();
  const utils = trpc.useUtils();

  const registrationsOpen = data?.registrationsOpen ?? true;

  const toggleRegistrations = () => {
    setRegistrationsOpen.mutate(
      { open: !registrationsOpen },
      {
        onSuccess: () => {
          void utils.config.get.invalidate();
        },
      },
    );
  };

  const unauthorized =
    isUnauthorizedError(error) ||
    isUnauthorizedError(setRegistrationsOpen.error);

  return {
    isLoading,
    unauthorized,
    registrationsOpen,
    toggleRegistrations,
  };
}
