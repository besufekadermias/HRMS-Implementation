import { useCallback, useEffect, useState } from "react";
import { useEmployeeStore } from "../../store/index.js";

export default function useDepartmentData(load) {
  const user = useEmployeeStore((state) => state.user);
  const owner = `${user?.id}:${user?.departmentId}:${user?.role}`;
  const [result, setResult] = useState({ owner: "", data: null, error: "" });
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await load(user, controller.signal);
        if (!controller.signal.aborted) setResult({ owner, data, error: "" });
      } catch (error) {
        if (!controller.signal.aborted)
          setResult({ owner, data: null, error: error.message });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load, user, owner, revision]);

  return {
    data: result.owner === owner ? result.data : null,
    error: result.owner === owner ? result.error : "",
    loading,
    refresh,
  };
}
