import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
// FIXME: why webpack ignores this ts lib?
import { CancelToken } from 'axios/dist/axios';

import { Button, TextBlock, FileSize, Icon } from '../../../../components';
import getClient from '../../../../services/api-client';
import DownloadFileProgression from '../DownloadFileProgression';
import './style.scss';

@withI18n()
class MessageAttachments extends Component {
  static propTypes = {
    message: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {};

  state = {
    downloads: {},
  };

  downloadRefs = {};

  cancelTokenSource = CancelToken.source();

  componentWillUnmount() {
    this.cancelTokenSource.cancel();
  }

  getRef = (index) => {
    if (!this.downloadRefs[index] || !this.downloadRefs[index].ref) {
      this.downloadRefs[index] = {
        ...this.downloadRefs[index],
        ref: createRef(),
      };
    }

    return this.downloadRefs[index].ref;
  };

  sendFileToBrowser = (index, { data, filename, mime }) => {
    const blob = new Blob([data], { type: mime || 'application/octet-stream' });
    const blobURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobURL;
    link.setAttribute('download', filename);
    this.downloadRefs[index].ref.current.appendChild(link);
    link.click();
    this.downloadRefs[index].ref.current.removeChild(link);
    window.URL.revokeObjectURL(blobURL);
  };

  createHandleClickDownload = ({ messageId, index, filename }) => {
    const client = getClient();

    return async () => {
      this.setState((prevState) => ({
        downloads: {
          ...prevState.downloads,
          [index]: {
            isFetching: true,
          },
        },
      }));
      const response = await client.get(
        `/api/v2/messages/${messageId}/attachments/${index}`,
        {
          cancelToken: this.cancelTokenSource.token,
          responseType: 'blob',
          onDownloadProgress: (ev) =>
            this.setState((prevState) => ({
              downloads: {
                ...prevState.downloads,
                [index]: {
                  progression: ev.loaded,
                  isFetching: ev.loaded < ev.total,
                },
              },
            })),
        }
      );
      this.sendFileToBrowser(index, { data: response.data, filename });
    };
  };

  renderDownload({ attachment, index }) {
    const {
      message: { message_id: messageId },
    } = this.props;

    return (
      <Button
        className="m-message-attachments__item"
        display="expanded"
        onClick={this.createHandleClickDownload({
          messageId,
          index,
          filename: attachment.file_name,
        })}
      >
        <TextBlock className="m-message-attachments__name">
          {attachment.file_name}
        </TextBlock>
        <DownloadFileProgression
          className="m-message-attachments__progression"
          isFetching={
            this.state.downloads[index] &&
            this.state.downloads[index].isFetching
          }
          value={
            this.state.downloads[index] &&
            this.state.downloads[index].progression
          }
          max={attachment.size}
        />
        <TextBlock className="m-message-attachments__size">
          <FileSize size={attachment.size} />
        </TextBlock>
        <span className="m-message-attachments__icon">
          <Icon type="download" />
        </span>
      </Button>
    );
  }

  render() {
    const {
      message: { attachments },
    } = this.props;

    if (!attachments || attachments.length === 0) {
      return null;
    }

    return (
      <ul className="m-message-attachments">
        {attachments.map((attachment, index) => (
          <li key={index} ref={this.getRef(index)}>
            {this.renderDownload({ attachment, index })}
          </li>
        ))}
      </ul>
    );
  }
}

export default MessageAttachments;
