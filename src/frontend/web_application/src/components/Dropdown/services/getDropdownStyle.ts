import { CSSProperties } from 'react';

const HEADER__HEIGHT = 42;

interface GetDropdownStyleProps {
  alignRight?: boolean;
  controlElement: HTMLElement;
  dropdownElement: HTMLElement;
  win?: Window;
}
// FIXME: how to calc when there is no controlElement?
export const getDropdownStyle = ({
  alignRight = false,
  controlElement,
  dropdownElement,
  win = window,
}: GetDropdownStyleProps): CSSProperties => {
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
  let height: undefined | string;
  let width: undefined | string;
  let top: string = `${initTop + controlRect.height}px`;
  let left: string = `${initLeft}px`;

  switch (true) {
    case isFullWidth || (isTouchingLeft && isTouchingRight):
      left = `${winX}px`;
      width = '100%';
      break;
    case (isAlignRight || isTouchingRight) && !isFullWidth:
      left = `${initLeft + offsetLeftWhenRightAligned}px`;
      break;
    default:
  }

  if (isFullHeight) {
    position = 'fixed';
    height = `${winHeight - HEADER__HEIGHT}px`;
    top = `${winY + HEADER__HEIGHT}px`;
  }

  const offset = {
    left,
    top,
    position,
    height,
    width,
  } as React.CSSProperties; // XXX: workaround position incompatible type

  return offset;
};
