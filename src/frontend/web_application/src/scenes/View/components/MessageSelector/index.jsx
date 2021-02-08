import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from '@lingui/react';
import {
  Checkbox,
  Spinner,
  Confirm,
  ActionBarButton,
} from '../../../../components';

import './style.scss';

@withI18n()
class MessageSelector extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    onToggleSelectAllMessages: PropTypes.func,
    onEditTags: PropTypes.func,
    onDeleteMessages: PropTypes.func,
    count: PropTypes.number,
    totalCount: PropTypes.number,
    indeterminate: PropTypes.bool,
    checked: PropTypes.bool,
    isDeleting: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onToggleSelectAllMessages: (str) => str,
    onEditTags: (str) => str,
    onDeleteMessages: (str) => str,
    count: 0,
    totalCount: 0,
    indeterminate: false,
    checked: false,
  };

  toggleCheckbox = () => {
    this.props.onToggleSelectAllMessages();
  };

  handleEditTags = () => {
    this.props.onEditTags();
  };

  handleDelete = () => {
    this.props.onDeleteMessages();
  };

  renderDeleteButton() {
    const { i18n, count, isDeleting } = this.props;

    if (count === 0) {
      return (
        <ActionBarButton
          icon={isDeleting ? <Spinner isLoading display="inline" /> : 'trash'}
          disabled
          aria-label={i18n._('message-list.action.delete', null, {
            defaults: 'Delete selected',
          })}
        />
      );
    }

    return (
      <Confirm
        onConfirm={this.handleDelete}
        title={
          <Trans id="message-list.confirm-delete.title">
            Delete message(s)
          </Trans>
        }
        content={
          <Trans id="message-list.confirm-delete.content">
            The deletion is permanent, are you sure you want to delete these
            messages?
          </Trans>
        }
        render={(confirm) => (
          <ActionBarButton
            icon={isDeleting ? <Spinner isLoading display="inline" /> : 'trash'}
            onClick={confirm}
            aria-label={i18n._('message-list.action.delete', null, {
              defaults: 'Delete selected',
            })}
          />
        )}
      />
    );
  }

  render() {
    const {
      i18n,
      count,
      totalCount,
      checked,
      isDeleting,
      indeterminate,
    } = this.props;

    return (
      <div className="m-message-selector">
        {count !== 0 && (
          <span className="m-message-selector__actions">
            {this.renderDeleteButton()}
          </span>
        )}
        {count !== 0 && (
          <span className="m-message-selector__title">
            <Trans
              id="message-list.selected"
              values={{ count, totalCount }}
              defaults="{count, plural, one {#/{totalCount} message:} other {#/{totalCount} messages:}}"
            />
          </span>
        )}
        <span className="m-message-selector__checkbox">
          <Checkbox
            label={i18n._('message-list.action.select_all', null, {
              defaults: 'Select/deselect all messages',
            })}
            id="message-list-selector"
            checked={checked}
            indeterminate={indeterminate}
            onChange={this.toggleCheckbox}
            disabled={isDeleting}
            showLabelforSr
          />
        </span>
      </div>
    );
  }
}

export default MessageSelector;
