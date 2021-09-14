import * as React from 'react';
import classnames from 'classnames';
import Icon from '../Icon';
import RawButton from '../RawButton';
import './style.scss';

interface Props extends React.ComponentProps<'button'> {
  className?: string;
  shape?: 'plain' | 'hollow';
  icon?: React.ReactElement | string;
  display?: 'inline' | 'inline-block' | 'block' | 'expanded';
  color?: 'success' | 'alert' | 'secondary' | 'active' | 'disabled';
  responsive?: 'icon-only' | 'text-only';
  accessKey?: string;
  noDecoration?: boolean;
  disabled?: boolean;
  center?: boolean;
  innerRef: React.ForwardedRef<HTMLButtonElement>;
}
function Button({
  children,
  className,
  icon,
  display = 'inline-block',
  color,
  shape,
  responsive,
  noDecoration = false,
  center = true,
  innerRef,
  ...props
}: Props) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      const iconProps = {
        ...icon.props,
        className: classnames(icon.props.className, 'm-button__icon'),
      };

      return <icon.type {...iconProps} />;
    }

    // @ts-ignore
    return <Icon className="m-button__icon" type={icon} />;
  };

  const buttonProps = {
    ...props,
    className: classnames(className, 'm-button', {
      'm-button--center': center,
      'm-button--active': color === 'active',
      'm-button--alert': color === 'alert',
      'm-button--secondary': color === 'secondary',
      'm-button--success': color === 'success',
      'm-button--disabled': color === 'disabled',

      'm-button--expanded': display === 'expanded',
      'm-button--inline': display === 'inline',
      'm-button--text': display === 'inline' && !noDecoration,
      'm-button--inline-block': display === 'inline-block',
      'm-button--block': display === 'block',

      'm-button--plain': shape === 'plain',
      'm-button--hollow': shape === 'hollow',

      'm-button--icon': icon,

      'm-button--icon-only': responsive === 'icon-only',
      'm-button--text-only': responsive === 'text-only',
    }),
  };

  if (icon) {
    return (
      // @ts-ignore
      <RawButton {...buttonProps} ref={innerRef}>
        {renderIcon()}
        {children && <span className="m-button__text">{children}</span>}
      </RawButton>
    );
  }

  return (
    // @ts-ignore
    <RawButton {...buttonProps} ref={innerRef}>
      {children}
    </RawButton>
  );
}

type ButtonProps = Omit<Props, 'innerRef'>;
export default React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button {...props} innerRef={ref} />
);
