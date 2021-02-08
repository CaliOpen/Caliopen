const HEADER__HEIGHT = 42;

// FIXME: how to calc when there is no controlElement?
export const getDropdownStyle = ({
  alignRight = false,
  controlElement,
  dropdownElement,
  win = window,
}) => {
  const controlRect = controlElement.getBoundingClientRect();
  const dropdownRect = dropdownElement.getBoundingClientRect();

  const winY = win.pageYOffset;
  const winX = win.pageXOffset;
  const winWidth = win.innerWidth;
  const winHeight = win.innerHeight;

  const offsetLeftWhenRightAligned = controlRect.width - dropdownRect.width;
  // since dropdownElement is position absolute & top & left at 0 this is the real offset according
  // to its relative parent
  const initLeft = controlRect.left - dropdownRect.left;
  const initTop = controlRect.top - dropdownRect.top;
  const isAlignRight = alignRight && initLeft + offsetLeftWhenRightAligned >= 0;
  const isTouchingRight = initLeft + dropdownRect.width >= winWidth + winX;
  const isTouchingLeft = controlRect.right - dropdownRect.width < 0;

  const isFullWidth = dropdownRect.width > winWidth;
  const isFullHeight = dropdownRect.height > winHeight;

  let position = 'absolute';
  let height;
  let width;
  let top = initTop + controlRect.height;
  let left = initLeft;

  switch (true) {
    case isFullWidth || (isTouchingLeft && isTouchingRight):
      left = winX;
      width = '100%';
      break;
    case (isAlignRight || isTouchingRight) && !isFullWidth:
      left = initLeft + offsetLeftWhenRightAligned;
      break;
    default:
  }

  if (isFullHeight) {
    position = 'fixed';
    height = winHeight - HEADER__HEIGHT;
    top = winY + HEADER__HEIGHT;
  }

  const offset = {
    left,
    top,
    position,
    height,
    width,
  };

  return offset;
};
