import { useState, useEffect, useRef } from "react";
import type { Account } from "../types";
import { DEFAULT_PERIOD } from "../lib/constants";

export function useOtpTimer(
  accounts: Account[],
  onExpired: () => void
) {
  const [remaining, setRemaining] = useState<Record<number, number>>({});
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;
  const prevRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const tick = () => {
      const accts = accountsRef.current;
      if (accts.length === 0) return;

      const now = Math.floor(Date.now() / 1000);
      const next: Record<number, number> = {};
      const prev = prevRef.current;
      let anyRolledOver = false;

      for (const acct of accts) {
        if (acct.otp_type === "totp" && acct.otp) {
          const period = acct.period ?? DEFAULT_PERIOD;
          const rem = period - (now % period);
          next[acct.id] = rem;
          if (prev[acct.id] !== undefined && prev[acct.id] <= 2 && rem > prev[acct.id]) {
            anyRolledOver = true;
          }
        }
      }

      prevRef.current = next;
      setRemaining(next);
      if (anyRolledOver) onExpiredRef.current();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return remaining;
}
