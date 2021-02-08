import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

export const SIZE_SMALL = 'small';
export const SIZE_MEDIUM = 'medium';
export const SIZE_LARGE = 'large';
export const SIZE_XLARGE = 'xlarge';
export const SIZE_XXLARGE = 'xxlarge';

class AvatarLetterWrapper extends PureComponent {
  static propTypes = {
    children: PropTypes.shape({}),
    size: PropTypes.oneOf([
      SIZE_SMALL,
      SIZE_MEDIUM,
      SIZE_LARGE,
      SIZE_XLARGE,
      SIZE_XXLARGE,
    ]),
    isRound: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    children: undefined,
    size: undefined,
    isRound: true,
    className: undefined,
  };

  render() {
    const { children, className, size, isRound, ...props } = this.props;
    const classNameShape = classnames({
      'm-avatar-letter-wrapper--round': isRound,
    });
    const classNameModifiers = {
      [SIZE_SMALL]: 'm-avatar-letter-wrapper--small',
      [SIZE_MEDIUM]: 'm-avatar-letter-wrapper--medium',
      [SIZE_LARGE]: 'm-avatar-letter-wrapper--large',
      [SIZE_XLARGE]: 'm-avatar-letter-wrapper--xlarge',
      [SIZE_XXLARGE]: 'm-avatar-letter-wrapper--xxlarge',
    };
    const classNameSize = classNameModifiers[size];
    const letterClassNameSize = classNameSize
      ? `${classNameSize}__letter`
      : null;
    const avatarLetter = React.Children.map(children, (child) => {
      const childProps = {
        ...child.props,
        ...props,
        className: classnames(
          'm-avatar-letter-wrapper__letter',
          letterClassNameSize
        ),
      };

      return <child.type {...childProps} />;
    });

    return (
      <div
        className={classnames(
          'm-avatar-letter-wrapper',
          className,
          classNameSize,
          classNameShape
        )}
      >
        {avatarLetter}
      </div>
    );
  }
}

export default AvatarLetterWrapper;
