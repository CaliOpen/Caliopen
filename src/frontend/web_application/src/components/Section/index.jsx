import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Title from '../Title';
import './style.scss';

class Section extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    descr: PropTypes.string,
    hasSeparator: PropTypes.bool,
    children: PropTypes.node,
  };

  static defaultProps = {
    className: undefined,
    title: undefined,
    descr: undefined,
    hasSeparator: false,
    children: undefined,
  };

  render() {
    const {
      title, descr, children, hasSeparator, className,
    } = this.props;

    return (
      <section className={classnames('m-section', { 'm-section--separator': hasSeparator }, className)}>
        {(title || descr) &&
          <header className="m-section__header">
            {title && <Title className="m-section__title">{title}</Title>}
            {descr && <p className="m-section__descr">{descr}</p>}
          </header>
        }
        {children}
      </section>
    );
  }
}

export default Section;
