"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function useUrlPagination(totalPages: number, paramKey = "page") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safeTotalPages = Math.max(1, totalPages);
  const pageFromUrl = Math.min(
    parsePage(searchParams.get(paramKey)),
    safeTotalPages,
  );

  const [page, setPageState] = useState(pageFromUrl);

  useEffect(() => {
    setPageState(pageFromUrl);
  }, [pageFromUrl]);

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.max(1, Math.min(nextPage, safeTotalPages));
      setPageState(safePage);

      const params = new URLSearchParams(searchParams.toString());

      if (safePage <= 1) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, String(safePage));
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [paramKey, pathname, router, searchParams, safeTotalPages],
  );

  return { page, setPage };
}
