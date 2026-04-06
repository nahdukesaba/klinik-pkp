"use client";

import { useEffect } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseAdminCreateIntentOptions {
  enabled: boolean;
  onCreate: () => void;
  queryKey?: string;
}

export function useAdminCreateIntent({
  enabled,
  onCreate,
  queryKey = "create",
}: UseAdminCreateIntentOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled || searchParams.get(queryKey) !== "1") {
      return;
    }

    onCreate();

    const params = new URLSearchParams(searchParams.toString());
    params.delete(queryKey);
    const nextQuery = params.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [enabled, onCreate, pathname, queryKey, router, searchParams]);
}
