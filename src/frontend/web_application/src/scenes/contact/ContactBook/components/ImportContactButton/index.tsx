import * as React from 'react';
import classnames from 'classnames';
import { Trans, useLingui } from '@lingui/react';
import { Button, Modal } from 'src/components';
import ImportContact from '../ImportContact';

interface Props {
  className?: string;
  onUploadSuccess: () => void;
}
function ImportContactButton({ className, onUploadSuccess }: Props) {
  const { i18n } = useLingui();
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  return (
    <>
      <Button
        className={classnames(className)}
        icon="upload"
        shape="plain"
        display="block"
        onClick={handleOpenImportModal}
      >
        <Trans id="contact-book.action.import" message="Import" />
      </Button>
      <Modal
        isOpen={isImportModalOpen}
        contentLabel={i18n._(
          /* i18n */ 'import-contact.action.import_contacts',
          undefined,
          {
            message: 'Import contacts',
          }
        )}
        title={i18n._(
          /* i18n */ 'import-contact.action.import_contacts',
          undefined,
          {
            message: 'Import contacts',
          }
        )}
        onClose={handleCloseImportModal}
      >
        <ImportContact
          onCancel={handleCloseImportModal}
          onUploadSuccess={onUploadSuccess}
        />
      </Modal>
    </>
  );
}

export default ImportContactButton;
