import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans, withI18n } from '@lingui/react';
import { Button, Modal } from '../../../../components';
import ImportContact from '../ImportContact';

@withI18n()
class ImportContactButton extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    onUploadSuccess: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  state = {
    isImportModalOpen: false,
  };

  handleOpenImportModal = () => {
    this.setState({
      isImportModalOpen: true,
    });
  };

  handleCloseImportModal = () => {
    this.setState({
      isImportModalOpen: false,
    });
  };

  renderImportModal = () => {
    const { i18n, onUploadSuccess } = this.props;

    return (
      <Modal
        isOpen={this.state.isImportModalOpen}
        contentLabel={i18n._(
          /* i18n */ 'import-contact.action.import_contacts',
          null,
          {
            message: 'Import contacts',
          }
        )}
        title={i18n._(
          /* i18n */ 'import-contact.action.import_contacts',
          null,
          {
            message: 'Import contacts',
          }
        )}
        onClose={this.handleCloseImportModal}
      >
        <ImportContact
          onCancel={this.handleCloseImportModal}
          onUploadSuccess={onUploadSuccess}
        />
      </Modal>
    );
  };

  render() {
    const { className } = this.props;

    return (
      <Fragment>
        <Button
          className={classnames(className)}
          icon="upload"
          shape="plain"
          display="block"
          onClick={this.handleOpenImportModal}
        >
          <Trans id="contact-book.action.import" message="Import" />
        </Button>
        {this.renderImportModal()}
      </Fragment>
    );
  }
}

export default ImportContactButton;
