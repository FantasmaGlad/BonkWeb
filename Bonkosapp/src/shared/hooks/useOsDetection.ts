import { useEffect, useState } from "react";
import type { Machine } from "../../types/machine";
import { detect, readHints } from "../lib/machine";

/** What the browser says about this computer, refined once Chromium answers its client hints. */
export function useOsDetection(): Machine {
  const [machine, setMachine] = useState(() => detect(navigator.userAgent, navigator.platform));

  useEffect(() => {
    let current = true;
    readHints().then((hints) => {
      if (current) {
        setMachine(detect(navigator.userAgent, navigator.platform, hints));
      }
    });
    return () => {
      current = false;
    };
  }, []);

  return machine;
}
