import { getTop } from './getTop';

export const getViewPortTop = (domNode, target = window) =>
  getTop(domNode) + target.scrollY;
