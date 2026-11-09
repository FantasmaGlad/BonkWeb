import { useEffect, useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = (value: string) => {
    // Without clipboard access (insecure context, refused permission) the text stays selectable.
    navigator.clipboard?.writeText(value).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return { copied, copy };
}
