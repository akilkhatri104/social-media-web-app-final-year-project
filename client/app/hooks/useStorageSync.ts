import { useEffect } from "react";
import { queryClient, queryKeys } from "~/lib/react-query";
import { STORAGE_KEYS } from "~/lib/storage";
import { safeLocalStorageGetItem } from "~/lib/storage";

export function useStorageSync() {
  useEffect(() => {
    function handleStorageEvent(event: StorageEvent) {
      if (event.key !== STORAGE_KEYS.CROSS_TAB_LOGOUT) return;

      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    }

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  useEffect(() => {
    const raw = safeLocalStorageGetItem(STORAGE_KEYS.CROSS_TAB_LOGOUT);
    if (!raw) return;

    let logoutTimestamp: number;
    try {
      logoutTimestamp = JSON.parse(raw);
    } catch {
      return;
    }

    if (typeof logoutTimestamp !== "number") return;

    const queryData = queryClient.getQueryData(queryKeys.auth.me);
    if (queryData != null) {
      queryClient.setQueryData(queryKeys.auth.me, null);
    }
  }, []);
}
