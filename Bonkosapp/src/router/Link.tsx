import type { AnchorHTMLAttributes, MouseEvent } from "react";
import type { Params } from "./address";
import { useHref, useNavigate } from "./Router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  params?: Params;
};

const plainClick = (event: MouseEvent) =>
  event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

export function Link({ to, params, onClick, ...rest }: Props) {
  const href = useHref()(to, params);
  const navigate = useNavigate();
  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && plainClick(event)) {
          event.preventDefault();
          navigate(href);
        }
      }}
    />
  );
}
