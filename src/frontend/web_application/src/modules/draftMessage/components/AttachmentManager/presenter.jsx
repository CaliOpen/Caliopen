import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import {
  Link,
  FileSize,
  TextBlock,
  Button,
  Modal,
  InputFileGroup,
  Spinner,
  Icon,
} from '../../../../components';
import { getMaxSize } from '../../../../services/config';
import './style.scss';

function generateStateFromProps(props) {
  const { message } = props;

  if (message) {
    return { attachments: message.attachments || [] };
  }

  return {};
}

class AttachmentManager extends Component {
  static propTypes = {
    onUploadAttachments: PropTypes.func.isRequired,
    message: PropTypes.shape({}),
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    notifyError: PropTypes.func.isRequired,
    onDeleteAttachement: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    message: undefined,
    disabled: false,
  };

  state = {
    attachments: [],
    isFetching: {},
    isImportModalOpen: false,
    isAttachmentsLoading: false,
  };

  UNSAFE_componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.message !== this.props.message) {
      this.setState(generateStateFromProps(nextProps));
    }
  }

  createHandleDeleteAttachement = (tempId) => async () => {
    this.setState((state) => ({
      isFetching: {
        ...state.isFetching,
        [tempId]: true,
      },
    }));

    const { onDeleteAttachement, notifyError } = this.props;

    try {
      await onDeleteAttachement(
        this.state.attachments.find(
          (attachement) => attachement.temp_id === tempId
        )
      );
    } catch ({ message }) {
      notifyError({ message });
    }

    this.setState((state) => ({
      isFetching: {
        ...state.isFetching,
        [tempId]: undefined,
      },
    }));
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

  handleInputFileChange = async (attachment) => {
    const { onUploadAttachments, notifyError } = this.props;

    this.setState({
      isAttachmentsLoading: true,
      isImportModalOpen: false,
    });

    try {
      // const FIXME cf. #480 multiple files
      await onUploadAttachments({ attachments: [attachment] });
    } catch (errors) {
      new Set(errors.map((err) => err.message)).forEach((message) =>
        notifyError({ message })
      );
    }

    this.setState({
      isAttachmentsLoading: false,
    });
  };

  renderImportModal = () => {
    const { i18n } = this.props;

    const errors = {};

    return (
      <Modal
        isOpen={this.state.isImportModalOpen}
        contentLabel={i18n._('draft.action.import_attachement', null, {
          defaults: 'Import attachement',
        })}
        title={i18n._('draft.action.import_attachement', null, {
          defaults: 'Import attachement',
        })}
        onClose={this.handleCloseImportModal}
      >
        <TextBlock
          nowrap={false}
          className="m-attachement-manager__encryption-warning"
        >
          <Trans id="draft.action.import_attachement.encryption_warning">
            WARNING: Caliopen cannot encrypt messages with attachments yet. If
            you proceed now, message will be sent unencrypted.
          </Trans>
        </TextBlock>
        <InputFileGroup
          onInputChange={this.handleInputFileChange}
          errors={errors}
          descr={i18n._('draft.attachement.form.descr', null, {
            defaults: 'Attach a file.',
          })}
          maxSize={getMaxSize()}
          multiple={false} // disable multiple due to issue in api cf. #840
        />
      </Modal>
    );
  };

  render() {
    const { i18n, message, disabled } = this.props;

    return (
      <div className="m-attachement-manager">
        <ul className="m-attachement-manager__list">
          {this.state.attachments.map((attachement) => (
            <li
              key={attachement.temp_id}
              className="m-attachement-manager__item"
            >
              <Link
                className="m-attachement-manager__file-name"
                href={`/api/v2/messages/${message.message_id}/attachments/${attachement.temp_id}`}
                download={attachement.file_name}
              >
                {attachement.file_name}
              </Link>
              <TextBlock className="m-attachement-manager__file-size">
                <FileSize size={attachement.size} />
              </TextBlock>
              <Button
                className="m-attachement-manager__file-delete"
                onClick={this.createHandleDeleteAttachement(
                  attachement.temp_id
                )}
                icon={
                  this.state.isFetching[attachement.temp_id] ? (
                    <Spinner isLoading display="inline" />
                  ) : (
                    <Icon type="remove" />
                  )
                }
                aria-label={i18n._(
                  'message.compose.action.delete_attachement',
                  null,
                  { defaults: 'Delete the attachment' }
                )}
              />
            </li>
          ))}
        </ul>
        <Button
          className="m-attachement-manager__button"
          onClick={this.handleOpenImportModal}
          icon={
            this.state.isAttachmentsLoading ? (
              <Spinner isLoading display="inline" />
            ) : (
              <Icon type="paperclip" />
            )
          }
          disabled={disabled}
        >
          <Trans id="message.compose.action.open_import_attachements">
            Add an attachement
          </Trans>
        </Button>
        {this.renderImportModal()}
      </div>
    );
  }
}

export default AttachmentManager;
