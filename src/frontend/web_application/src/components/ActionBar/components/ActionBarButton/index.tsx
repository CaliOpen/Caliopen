import classnames from 'classnames';
import * as React from 'react';
import Button from '../../../Button';

type ButtonProps = React.ComponentProps<typeof Button>;
interface Props extends ButtonProps {
  className?: string;
  innerRef: React.ForwardedRef<HTMLButtonElement>;
}
function ActionBarButton({ className, innerRef, ...props }: Props) {
  return (
    <Button
      ref={innerRef}
      className={classnames('m-action-bar__action-btn', className)}
      {...props}
    />
  );
}

type ActionBarButtonProps = Omit<Props, 'innerRef'>;
export default React.forwardRef<HTMLButtonElement, ActionBarButtonProps>(
  (props, ref) => <ActionBarButton innerRef={ref} {...props} />
);
