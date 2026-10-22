import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULTS = {
  page: "1",
  pageSize: "10",
};

export default function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = {};

    for (const [key, value] of searchParams.entries()) {
      result[key] = value;
    }

    return {
      ...DEFAULTS,
      ...result,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (changes, options = {}) => {
      const next = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      if (options.resetPage !== false) {
        next.set("page", "1");
      }

      setSearchParams(next, {
        replace: options.replace ?? false,
      });
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      {
        page: DEFAULTS.page,
        pageSize: DEFAULTS.pageSize,
      },
      { replace: false },
    );
  }, [setSearchParams]);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}
