"use client";

import { trpc } from "@/lib/trpc";

export function useAdminConfig() {
  const { data, isLoading } = trpc.config.get.useQuery();
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

  return {
    isLoading,
    registrationsOpen,
    toggleRegistrations,
  };
}
