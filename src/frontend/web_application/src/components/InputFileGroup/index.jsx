import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans, withI18n } from '@lingui/react';
import FieldGroup from '../FieldGroup';
import InputFile from '../InputFile';
import FileSize from '../FileSize';

import File from './components/File';

import './style.scss';

@withI18n()
class InputFileGroup extends Component {
  static propTypes = {
    onInputChange: PropTypes.func.isRequired,
    errors: PropTypes.shape({}),
    i18n: PropTypes.shape({
      _: PropTypes.func,
    }).isRequired,
    multiple: PropTypes.bool,
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    maxSize: PropTypes.number,
    className: PropTypes.string,
    descr: PropTypes.string,
  };

  static defaultProps = {
    errors: {},
    fileTypes: undefined,
    maxSize: undefined,
    multiple: false,
    className: null,
    descr: null,
  };

  state = {
    files: [],
    fieldErrors: [],
  };

  handleInputChange = (ev) => {
    const { onInputChange, multiple } = this.props;
    const files = ev.target.files.length > 0 ? Array.from(ev.target.files) : [];

    return Promise.all(files.map((file) => this.validate(file)))
      .then((validatedFiles) => {
        this.setState({ files: validatedFiles });

        if (!multiple) {
          return onInputChange(validatedFiles[0]);
        }

        return onInputChange(validatedFiles);
      })
      .catch((fieldErrors) => this.setState({ fieldErrors }));
  };

  resetForm = () => {
    this.setState({
      files: [],
      fieldErrors: [],
    });

    return this.props.onInputChange([]);
  };

  validate = (file) => {
    const { i18n, fileTypes, maxSize } = this.props;
    const errors = [];

    if (!file) {
      return Promise.reject(
        i18n._('input-file-group.error.file_is_required', null, {
          defaults: 'A file is required',
        })
      );
    }

    const ext = file.name ? `.${file.name.split('.').pop()}` : null;
    if (fileTypes && (!ext || !fileTypes.includes(ext))) {
      errors.push(
        <Trans id="input-file-group.error.no_valid_ext">
          Only files {fileTypes.join(', ')}
        </Trans>
      );
    }

    if (maxSize && file.size > maxSize) {
      errors.push(
        <Trans id="input-file-group.error.max_size">
          The file size must be under <FileSize size={maxSize} />
        </Trans>
      );
    }

    if (errors.length) {
      return Promise.reject(errors);
    }

    return Promise.resolve(file);
  };

  render() {
    const { errors, descr, className, fileTypes, multiple } = this.props;
    const allErrors = errors
      ? Object.keys(errors).map((key) => errors[key])
      : null;
    const acceptProp = fileTypes ? { accept: fileTypes } : {};

    return (
      <FieldGroup
        className={classnames('m-input-file-group', className)}
        errors={allErrors}
      >
        {descr && <p>{descr}</p>}

        {this.state.files.length > 0 ? (
          this.state.files.map((file) => (
            <File file={file} onRemove={this.resetForm} />
          ))
        ) : (
          <InputFile
            onChange={this.handleInputChange}
            errors={this.state.fieldErrors}
            {...acceptProp}
            multiple={multiple}
          />
        )}
      </FieldGroup>
    );
  }
}

export default InputFileGroup;
