import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from '@lingui/react';
import { Checkbox, Button, Spinner, Confirm } from '../../../../components';

import './style.scss';

@withI18n()
class DiscussionSelector extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    onSelectAllDiscussions: PropTypes.func,
    onEditTags: PropTypes.func,
    onDeleteDiscussions: PropTypes.func,
    count: PropTypes.number,
    totalCount: PropTypes.number,
    indeterminate: PropTypes.bool,
    checked: PropTypes.bool,
    isDeleting: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onSelectAllDiscussions: (str) => str,
    onEditTags: (str) => str,
    onDeleteDiscussions: (str) => str,
    count: 0,
    totalCount: 0,
    indeterminate: false,
    checked: false,
  };

  toggleCheckbox = (ev) => {
    const { checked } = ev.target;
    this.props.onSelectAllDiscussions(checked ? 'select' : 'unselect');
  };

  handleEditTags = () => {
    this.props.onEditTags();
  };

  handleDelete = () => {
    this.props.onDeleteDiscussions();
  };

  renderDeleteButton() {
    const { i18n, count, isDeleting } = this.props;

    if (count === 0) {
      return (
        <Button
          icon={
            isDeleting ? (
              <Spinner
                svgTitleId="delete-discussions-spinner"
                isLoading
                display="inline"
              />
            ) : (
              'trash'
            )
          }
          disabled
          aria-label={i18n._(/* i18n */ 'timeline.action.delete', null, {
            message: 'Delete selected',
          })}
        />
      );
    }

    return (
      <Confirm
        onConfirm={this.handleDelete}
        title={
          <Trans
            id="timeline.confirm-delete.title"
            message="Delete discussion(s)"
          />
        }
        content={
          <Trans id="timeline.confirm-delete.content">
            The deletion is permanent, are you sure you want to delete these
            discussions ?
          </Trans>
        }
        render={(confirm) => (
          <Button
            icon={
              isDeleting ? (
                <Spinner
                  svgTitleId="delete-discussion-confirm-spinner"
                  isLoading
                  display="inline"
                />
              ) : (
                'trash'
              )
            }
            onClick={confirm}
            aria-label={i18n._(/* i18n */ 'timeline.action.delete', null, {
              message: 'Delete selected',
            })}
          />
        )}
      />
    );
  }

  render() {
    const { i18n, count, totalCount, checked, isDeleting, indeterminate } =
      this.props;

    return (
      <div className="m-discussion-selector">
        {count !== 0 && (
          <span className="m-discussion-selector__title">
            <Trans
              id="timeline.discussions.selected"
              message="{count, plural, one {#/{totalCount} discussion:} other {#/{totalCount} discussions:}"
              value={{ count, totalCount }}
            />
          </span>
        )}
        {/*
          (checked || indeterminate) && // show buttons only when one or more is selected
          <span className="m-discussion-selector__actions">
            <Button
              icon="tags"
              onClick={this.handleEditTags}
              disabled={count === 0}
              aria-label={i18n._(/* i18n  'timeline.action.manage-tags', null, { message: 'Manage tags' })}
            />
            {this.renderDeleteButton()}
          </span>
          */}
        <span className="m-discussion-selector__checkbox">
          <Checkbox
            label={i18n._(
              /* i18n */ 'message-list.action.select_all_discussions',
              null,
              {
                message: 'Select/deselect all discussions',
              }
            )}
            id="discussion-selector"
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

export default DiscussionSelector;
