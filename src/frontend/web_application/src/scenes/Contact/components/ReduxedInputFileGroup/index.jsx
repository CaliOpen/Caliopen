import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import { readAsText } from '../../../../modules/file';
import { InputFile, FieldGroup, FileSize } from '../../../../components';
import File from '../../../../components/InputFileGroup/components/File';

import './style.scss';

@withI18n()
class ReduxedInputFileGroup extends PureComponent {
  static propTypes = {
    input: PropTypes.shape({
      onChange: PropTypes.func.isRequired,
      onBlur: PropTypes.func.isRequired,
      value: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    meta: PropTypes.shape({
      error: PropTypes.string,
    }).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    id: PropTypes.string,
    mimeTypes: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    label: PropTypes.string,
    fileAsContent: PropTypes.bool,
    maxSize: PropTypes.number,
    accept: PropTypes.string,
  };

  state = {
    files: [],
    localErrors: [],
  };

  static defaultProps = {
    id: undefined,
    mimeTypes: [],
    className: undefined,
    label: undefined,
    fileAsContent: false,
    maxSize: undefined,
    accept: undefined,
  };

  makeHandleEvent = (eventHandler) => async (e) => {
    const { fileAsContent } = this.props;

    try {
      const files = Array.from(e.target.files);

      this.setState({
        files: await Promise.all(files.map((file) => this.validate(file))),
        errors: [],
      });

      if (fileAsContent) {
        return eventHandler(await readAsText(files[0]));
      }
    } catch (errors) {
      this.setState({
        files: [],
        errors,
      });
    }

    return eventHandler(this.state.files);
  };

  resetForm = () => {
    const { fileAsContent, input } = this.props;

    input.onChange(fileAsContent ? null : []);

    this.setState({
      files: [],
      localErrors: [],
    });
  };

  validate = (file) => {
    const { i18n, maxSize } = this.props;
    const errors = [];

    if (!file) {
      return Promise.reject(
        i18n._('input-file-group.error.file_is_required', null, {
          defaults: 'A file is required',
        })
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
    const { accept, label, id, input, meta, className } = this.props;
    const actualId = id || uuidV1();

    return (
      <FieldGroup
        className={classnames('m-input-file-group', className)}
        errors={[...(meta.error || []), ...this.state.localErrors]}
      >
        {
          // label does not need to be unigue
          // see : https://www.w3.org/TR/html50/forms.html#dom-lfe-labels
          label && (
            <label
              htmlFor={actualId}
              className="m-label m-reduxed-input-file-group__label"
            >
              {label}
            </label>
          )
        }

        {
          // first condition mandatory on first re-render after a reset
          // as input.value is still here.
          this.state.files.length > 0 && input.value ? (
            this.state.files.map((file) => (
              <File file={file} onRemove={this.resetForm} />
            ))
          ) : (
            <InputFile
              id={actualId}
              name="files"
              onChange={this.makeHandleEvent(input.onChange)}
              accept={accept}
              errors={[]}
            />
          )
        }
      </FieldGroup>
    );
  }
}

export default ReduxedInputFileGroup;
