import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getClient from '../../../../services/api-client';
import ImportContactForm from '../ImportContactForm';
import UploadFileAsFormField from '../../../../modules/file/services/uploadFileAsFormField';

class ImportContact extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    onCancel: PropTypes.func,
    onUploadSuccess: PropTypes.func,
    notifySuccess: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onCancel: null,
    onUploadSuccess: () => {},
  }

  state = {
    errors: {},
    hasImported: false,
    isLoading: false,
  };

  handleImportContact = ({ file }) => {
    const data = new UploadFileAsFormField(file, 'file');

    this.setState({ isLoading: true });
    getClient().post('/api/v1/imports', data)
      .then(this.handleImportContactSuccess, this.handleImportContactError)
      .then(() => this.setState({ isLoading: false }));
  }

  handleImportContactSuccess = () => {
    this.setState({ hasImported: true }, () => {
      const { onUploadSuccess, notifySuccess, i18n } = this.props;
      notifySuccess({ message: i18n._('import-contact.feedback.successfull', { defaults: 'Contacts successfully imported' }), duration: 0 });
      onUploadSuccess();
    });
  }

  handleImportContactError = ({ response }) => {
    const { notifyError, i18n } = this.props;

    if (response.status === 400) {
      return notifyError({ message: i18n._('import-contact.feedback.error-file', { defaults: 'This file cannot be used to import contacts' }), duration: 0 });
    }

    if (response.status === 422) {
      return notifyError({ message: i18n._('import-contact.feedback.error-contact', { defaults: 'The file is valid but new contacts cannot be created' }), duration: 0 });
    }

    return notifyError({ message: i18n._('import-contact.feedback.unexpected-error', { defaults: 'An unexpected error occured.' }), duration: 0 });
  }

  render() {
    const { onCancel } = this.props;

    return (
      <ImportContactForm
        onCancel={onCancel}
        onSubmit={this.handleImportContact}
        errors={this.state.errors}
        hasImported={this.state.hasImported}
        isLoading={this.state.isLoading}
        formAction="/api/v1/imports"
      />
    );
  }
}

export default ImportContact;
