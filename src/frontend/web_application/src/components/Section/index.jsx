import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Title from '../Title';
import './style.scss';

class Section extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.node,
    titleProps: PropTypes.shape({}),
    descr: PropTypes.node,
    hasSeparator: PropTypes.bool,
    children: PropTypes.node,
    borderContext: PropTypes.oneOf(['disabled', 'safe', 'public', 'unsecure']),
    shape: PropTypes.oneOf(['plain', 'none']),
  };

  static defaultProps = {
    className: undefined,
    title: undefined,
    titleProps: {},
    descr: undefined,
    hasSeparator: false,
    children: undefined,
    borderContext: undefined,
    shape: 'plain',
  };

  render() {
    const {
      title,
      titleProps,
      descr,
      children,
      hasSeparator,
      className,
      borderContext,
      shape,
    } = this.props;

    const borderModifier = borderContext && {
      'm-section--border-disabled': borderContext === 'disabled',
      'm-section--border-safe': borderContext === 'safe',
      'm-section--border-public': borderContext === 'public',
      'm-section--border-unsecure': borderContext === 'unsecure',
    };

    const modifiers = {
      'm-section--plain': shape === 'plain',
      'm-section--separator': hasSeparator,
    };

    return (
      <section
        className={classnames(
          'm-section',
          modifiers,
          borderModifier,
          className
        )}
      >
        {(title || descr) && (
          <header className="m-section__header">
            {title && (
              <Title className="m-section__title" {...titleProps}>
                {title}
              </Title>
            )}
            {descr && <p className="m-section__descr">{descr}</p>}
          </header>
        )}
        {children}
      </section>
    );
  }
}

export default Section;
