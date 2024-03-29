import * as React from 'react';

export function useForwardedRef<T extends HTMLElement>(
  ref: React.ForwardedRef<T>
) {
  const innerRef = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref) {
      return;
    }

    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      // eslint-disable-next-line no-param-reassign
      ref.current = innerRef.current;
    }
  }, [ref]);

  return innerRef;
}
