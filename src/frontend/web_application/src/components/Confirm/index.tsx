import * as React from 'react';
import { Trans } from '@lingui/react';
import classnames from 'classnames';
import Button from '../Button';
import Modal from '../Modal';
import './style.scss';

type callback = () => void;

interface Props {
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  render: (confirm: callback) => React.ReactNode;
  title?: React.ReactNode;
  content?: React.ReactNode;
  confirmButtonContent?: React.ReactNode;
  className?: string;
}

const noop = () => {};
const defaultConfirmButton = (
  <Trans id="confirm.action.confirm" message="Yes I'm sure" />
);

/**
 * const usage = () => (
 *  <Confirm render={confirm => (<Button onClick={confirm}>Delete</Button>)} />
 * );
 */
function Confirm({
  render,
  onConfirm,
  onCancel = noop,
  onClose = noop,
  title,
  content,
  confirmButtonContent = defaultConfirmButton,
  className,
}: Props) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const confirm = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onCancel();
  };

  const handleConfirm = async () => {
    await Promise.resolve(onConfirm());
    // FIXME: it throws when unmounted in case onConfirm drop the component (e.g. delete)
    setIsModalOpen(false);
  };

  return (
    <div className={classnames(className, 'm-confirm')}>
      {render(confirm)}
      <Modal title={title} onClose={handleClose} isOpen={isModalOpen}>
        {content}
        <div className="m-confirm__actions">
          <Button shape="plain" onClick={handleCancel}>
            <Trans id="confirm.action.cancel" message="Cancel" />
          </Button>{' '}
          <Button shape="plain" color="alert" onClick={handleConfirm}>
            {confirmButtonContent}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Confirm;
