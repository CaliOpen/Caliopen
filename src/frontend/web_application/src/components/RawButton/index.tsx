import * as React from 'react';

interface Props extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  innerRef: React.ForwardedRef<HTMLButtonElement>;
}
function RawButton({
  type = 'button',
  innerRef,
  children,
  ...buttonProps
}: Props) {
  // this rules does not understand vars (2019-04-05)
  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} {...buttonProps} ref={innerRef}>
      {children}
    </button>
  );
}

type ButtonProps = Omit<Props, 'innerRef'>;
export default React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <RawButton {...props} innerRef={ref} />
);
