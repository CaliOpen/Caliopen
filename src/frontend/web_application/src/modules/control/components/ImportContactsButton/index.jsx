import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import ImportContact from '../../../../scenes/ContactBook/components/ImportContact';
import { Button, Modal } from '../../../../components';

class ImportContactsButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    requestContacts: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  state = {
    isImportModalOpen: false,
  };

  handleUploadSuccess = () => {
    this.props.requestContacts();
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

  renderImportModal = () => (
    <Modal
      isOpen={this.state.isImportModalOpen}
      contentLabel={
        <Trans id="import-contact.action.import_contacts">
          Import contacts
        </Trans>
      }
      title={
        <Trans id="import-contact.action.import_contacts">
          Import contacts
        </Trans>
      }
      onClose={this.handleCloseImportModal}
    >
      <ImportContact
        onCancel={this.handleCloseImportModal}
        onUploadSuccess={this.handleUploadSuccess}
      />
    </Modal>
  );

  render() {
    const { className } = this.props;

    return (
      <Fragment>
        <Button
          shape="plain"
          icon="plus"
          className={className}
          onClick={this.handleOpenImportModal}
        >
          <Trans id="import-contact.action.import_contacts">
            Import contacts
          </Trans>
        </Button>
        {this.renderImportModal()}
      </Fragment>
    );
  }
}

export default ImportContactsButton;
