import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { scrollTop } from '../services/scrollTop';
import { getViewPortTop } from '../services/getViewPortTop';

interface Options {
  focusable?: boolean;
}
/**
 * Usage, it will scroll to the div when the hash becomes 'reply':
 * const ref = useScrollToMe('reply');
 * …
 * <div ref={ref} />
 *
 * @param {string} me corresponding hash to handle
 */
export function useScrollToMe(me: string, { focusable }: Options = {}) {
  const { hash } = useLocation();
  const ref = React.useRef<any>();

  React.useEffect(() => {
    if (hash === me && ref.current) {
      const top = getViewPortTop(ref.current);
      scrollTop(top);
      if (focusable) {
        ref.current.focus();
      }
    }
  }, [hash]);

  return ref;
}
