import React, { PropTypes } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import './style.scss';

const Modal = ({ className, title, children, onClose, ...props }) => (
  <ReactModal
    className={classnames('m-modal', className)}
    overlayClassName="m-modal__overlay"
    {...props}
  >
    <header className="m-modal__header">
      {title && (
        <div className="m-modal__title">{title}</div>
      )}
      <Button inline className="m-modal__close" onClick={onClose}><Icon type="remove" /></Button>
    </header>
    <div className="m-modal__content">
      {children}
    </div>
  </ReactModal>
);

Modal.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  children: PropTypes.node,
  onClose: PropTypes.func,
};

export default Modal;
