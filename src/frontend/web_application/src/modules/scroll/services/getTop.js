export const HEADER_HEIGHT = 120;
export const getTop = (domNode) =>
  domNode.getBoundingClientRect().top - HEADER_HEIGHT;
