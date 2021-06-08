import * as React from 'react';
import classnames from 'classnames';
import './style.scss';

interface Props {
  expanded: boolean;
  theme: string;
  bottomSpace: boolean;
  hasError: boolean;
  className?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  innerRef: React.ForwardedRef<any>;
}
function InputText({
  className,
  expanded = false,
  theme = 'light',
  bottomSpace = false,
  hasError = false,
  inputProps,
  innerRef,
}: Props) {
  const inputTextClassName = classnames(
    'm-input-text',
    {
      'm-input-text--expanded': expanded,
      'm-input-text--light': theme === 'light',
      'm-input-text--dark': theme === 'dark',
      'm-input-text--contrasted': theme === 'contrasted',
      'm-input-text--bottom-space': bottomSpace,
      'm-input-text--error': hasError,
    },
    className
  );

  return (
    <input
      type="text"
      className={inputTextClassName}
      ref={innerRef}
      {...inputProps}
    />
  );
}

export default React.forwardRef<typeof InputText, Props>((props, ref) => (
  <InputText {...props} innerRef={ref} />
));
