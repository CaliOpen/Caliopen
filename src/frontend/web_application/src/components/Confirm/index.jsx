import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from 'lingui-react';
import classnames from 'classnames';
import Button from '../Button';
import Modal from '../Modal';
import './style.scss';

// const usage = () => (
//   <Confirm render={confirm => (<Button onClick={confirm}>Delete</Button>)} />
// );

@withI18n()
class Confirm extends PureComponent {
  static propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    render: PropTypes.func.isRequired,
    title: PropTypes.node,
    content: PropTypes.node,
    confirmButtonContent: PropTypes.node,
    className: PropTypes.string,
  };
  static defaultProps = {
    onCancel: () => {},
    onClose: () => {},
    className: undefined,
    title: undefined,
    content: undefined,
    confirmButtonContent: undefined,
  };
  state = {
    isModalOpen: false,
  };

  confirm = () => {
    this.setState({
      isModalOpen: true,
    });
  };

  handleClose = () => {
    const { onClose } = this.props;

    this.setState({
      isModalOpen: false,
    }, () => {
      onClose();
    });
  }

  handleCancel = () => {
    const { onCancel } = this.props;

    this.setState({
      isModalOpen: false,
    }, () => {
      onCancel();
    });
  }


  handleConfirm = async () => {
    const { onConfirm } = this.props;
    try {
      await onConfirm();
      // FIXME: it throws when unmounted in case onConfirm drop the component (e.g. delete)
      this.setState({
        isModalOpen: false,
      });
    } catch (err) {
      // nothing to do
      // the developer should display an error
      // FIXME: does this capture an error and doesn't make the dev aware of this error ?
    }
  }

  renderModal() {
    const { title, content, confirmButtonContent } = this.props;

    const confirmBtn = confirmButtonContent || (<Trans id="confirm.action.confirm">Yes I&apos;m sure</Trans>);

    return (
      <Modal
        title={title}
        onClose={this.handleClose}
        isOpen={this.state.isModalOpen}
      >
        {content}
        <div className="m-confirm__actions">
          <Button shape="plain" onClick={this.handleCancel}><Trans id="confirm.action.cancel">Cancel</Trans></Button>
          {' '}
          <Button shape="plain" color="alert" onClick={this.handleConfirm}>{confirmBtn}</Button>
        </div>

      </Modal>
    );
  }

  render() {
    const { className, render } = this.props;

    return (
      <div className={classnames(className, 'm-confirm')}>
        {render(this.confirm)}
        {this.renderModal()}
      </div>
    );
  }
}

export default Confirm;
