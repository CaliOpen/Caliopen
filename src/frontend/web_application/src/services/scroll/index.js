import scroll from 'scroll';
import scrollDoc from './scroll-doc';


export const HEADER_HEIGHT = 120;
export const getTop = domNode => domNode.getBoundingClientRect().top - HEADER_HEIGHT;
export const getViewPortTop = (domNode, target = window) => getTop(domNode) + target.scrollY;
export const scrollTop = (y, isAnimated = false) => {
  if (isAnimated) {
    scroll.top(scrollDoc(), y, { duration: isAnimated ? 350 : 1 });

    return;
  }

  window.scroll(0, y);
};
