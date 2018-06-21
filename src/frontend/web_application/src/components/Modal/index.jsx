import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import Button from '../Button';
import './style.scss';

class Modal extends Component {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.node,
    children: PropTypes.node,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    className: undefined,
    title: undefined,
    children: undefined,
    onClose: () => {},
  };

  componentDidMount() {
    ReactModal.setAppElement('#root');
  }

  render() {
    const {
      className, title, children, onClose, ...props
    } = this.props;

    return (
      <ReactModal
        className={classnames('m-modal', className)}
        overlayClassName="m-modal__overlay"
        {...props}
      >
        <header className="m-modal__header">
          {title && (
            <div className="m-modal__title">{title}</div>
          )}
          <Button className="m-modal__close" onClick={onClose} icon="remove" />
        </header>
        <div className="m-modal__content">
          {children}
        </div>
      </ReactModal>
    );
  }
}

export default Modal;
