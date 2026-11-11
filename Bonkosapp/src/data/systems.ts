import type { Stated } from "../types/system";

/** Drive sizes a publisher asks for beyond the image itself, in GB. */
export const PUBLISHER_DRIVES: Readonly<Record<string, Stated>> = {
  tails: { value: 8, source: "https://tails.net/doc/about/requirements/" },
};
