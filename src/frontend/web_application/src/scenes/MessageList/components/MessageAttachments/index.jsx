import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'lingui-react';
import { Link, TextBlock, FileSize, Icon } from '../../../../components';
import './style.scss';

@withI18n()
class MessageAttachments extends Component {
  static propTypes = {
    message: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
  };

  render() {
    const { message: { message_id: messageId, attachments } } = this.props;

    if (!attachments || attachments.length === 0) {
      return null;
    }

    return (
      <ul className="m-message-attachments">
        {attachments.map((attachment, index) => (
          <li key={index}>
            <Link
              className="m-message-attachments__item"
              button
              expanded
              href={`/api/v2/messages/${messageId}/attachments/${index}`}
              download={attachment.file_name}
              title={attachment.file_name}
            >
              <TextBlock className="m-message-attachments__name">
                {attachment.file_name}
              </TextBlock>
              <TextBlock className="m-message-attachments__size">
                <FileSize size={attachment.size} />
              </TextBlock>
              <span className="m-message-attachments__icon">
                <Icon type="download" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}

export default MessageAttachments;
