import * as React from 'react';
import { Link as BaseLink, LinkProps as BaseLinkProps } from 'react-router-dom';
import classnames from 'classnames';
import Icon from '../Icon';
import './style.scss';

interface CommonProps {
  children?: React.ReactNode;
  center?: boolean;
  display?: 'inline' | 'inline-block' | 'block' | 'expanded';
  target?: string;
  noDecoration?: boolean;
  className?: string;
  shape?: 'plain' | 'hollow';
  button?: boolean;
  badge?: boolean;
  active?: boolean;
  icon?: React.ReactElement | string;
}

type ALinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & CommonProps;
type LinkProps = BaseLinkProps & CommonProps;
type Props = ALinkProps | LinkProps;

function Link({
  children,
  display,
  noDecoration,
  className,
  shape,
  button,
  badge,
  active,
  target,
  icon,
  center = button, // by default, link content is centered when it acts like button
  ...props
}: Props) {
  const linkProps = {
    ...props,
    target,
    // https://mathiasbynens.github.io/rel-noopener/
    rel: target && 'noopener noreferrer',
    className: classnames(className, 'm-link', {
      'm-link--button': button,
      'm-link--center': center,
      'm-link--badge': badge,
      'm-link--active': active,
      // display
      'm-link--block': display === 'block',
      'm-link--expanded': display === 'expanded',
      'm-link--inline': display === 'inline',
      'm-link--inline-block': display === 'inline-block',
      'm-link--text': (!button || display === 'inline') && !noDecoration,
      // shape
      'm-link--plain': shape === 'plain',
      'm-link--hollow': shape === 'hollow',
    }),
  };

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      const iconProps = {
        ...icon.props,
        className: classnames(icon.props.className, 'm-link__icon'),
      };

      return <icon.type {...iconProps} />;
    }

    // @ts-ignore
    return <Icon className="m-link__icon" type={icon} />;
  };

  // @ts-ignore
  if (props.to) {
    return (
      // @ts-ignore
      <BaseLink {...linkProps}>
        {icon ? (
          <>
            {renderIcon()}
            <span className="m-link__text">{children}</span>
          </>
        ) : (
          children
        )}
      </BaseLink>
    );
  }

  return (
    <a {...linkProps}>
      {icon ? (
        <>
          {renderIcon()}
          <span className="m-link__text">{children}</span>
        </>
      ) : (
        children
      )}
    </a>
  );
}

export default Link;
