export const getOffset = (alignRight, position, control, dropdown) => {
  const controlRect = control.length
    ? control[0].getBoundingClientRect()
    : control.getBoundingClientRect();

  const dropdownRect = dropdown.length
    ? dropdown[0].getBoundingClientRect()
    : dropdown.getBoundingClientRect();

  const winY = window.pageYOffset;
  const winX = window.pageXOffset;
  const winWidth = window.innerWidth;
  // const winHeight = window.innerHeight;

  const alignRightOffset = controlRect.width - dropdownRect.width;
  const initTop = (controlRect.top + winY) - (dropdownRect.top + winY);
  const initLeft = (controlRect.left + winX) - (dropdownRect.left + winX);

  const isAlignRight = alignRight && (initLeft + alignRightOffset >= 0);
  const isTouchingRight = (initLeft + controlRect.width + dropdownRect.width) >= (winWidth + winX);


  const offsetY = position === 'top' ? (initTop - dropdownRect.height) : (initTop + controlRect.height);
  const offsetX = isAlignRight || isTouchingRight ? (initLeft + alignRightOffset) : initLeft;

  const offset = {
    left: offsetX,
    top: offsetY,
  };

  return offset;
};
