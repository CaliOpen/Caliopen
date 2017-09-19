import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { v1 as uuidV1 } from 'uuid';
import Swipe from '../../../../components/Swipe';
import Button from '../../../../components/Button';
import DropdownMenu, { withDropdownControl } from '../../../../components/DropdownMenu';
import VerticalMenu, { VerticalMenuItem } from '../../../../components/VerticalMenu';
import Modal from '../../../../components/Modal';
import ManageTags from '../ManageTags';
import './style.scss';

const DropdownControl = withDropdownControl(Button);

class DiscussionItemContainer extends Component {
  static propTypes = {
    discussion: PropTypes.shape({}).isRequired,
    children: PropTypes.node.isRequired,
    __: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.dropdownId = uuidV1();
  }

  state = {
    isActive: false,
    isTagModalOpen: false,
  };

  handleOpenTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: true,
      isActive: true,
    }));
  }

  handleCloseTags = () => {
    this.setState(prevState => ({
      ...prevState,
      isTagModalOpen: false,
    }));
  }

  handleHover = () => {
    this.setState(prevState => ({
      ...prevState,
      isActive: true,
    }));
  }

  handleBlur = () => {
    this.setState(prevState => ({
      ...prevState,
      isActive: prevState.isTagModalOpen === true ? prevState.isActive : false,
    }));
  }

  renderMenuDropdown = () => {
    const { __ } = this.props;

    return (
      <DropdownMenu
        id={this.dropdownId}
        position="bottom"
        closeOnClick
        hasTriangle
      >
        <VerticalMenu className="m-discussion-item-container__action-menu">
          <VerticalMenuItem>
            <Button
              className="m-discussion-item-container__action-button"
              display="expanded"
            >{__('discussion-item-actions.archives')}</Button>
          </VerticalMenuItem>
          <VerticalMenuItem>
            <Button
              className="m-discussion-item-container__action-button"
              display="expanded"
            >{__('discussion-item-actions.enable_tracking')}</Button>
          </VerticalMenuItem>
          <VerticalMenuItem>
            <Button
              className="m-discussion-item-container__action-button"
              display="expanded"
              onClick={this.handleOpenTags}
            >{__('discussion-item-actions.manage_tags')}</Button>
          </VerticalMenuItem>
        </VerticalMenu>
      </DropdownMenu>
    );
  }

  renderActions= () => {
    const { __ } = this.props;
    const actionsClassName = classnames(
      'm-discussion-item-container__actions',
      { 'm-discussion-item-container--active__actions': this.state.isActive },
      { 'm-discussion-item-container--hover__actions': this.state.isHoverActive },
    );

    return (
      <div className={actionsClassName}>
        <Button shape="plain" className="m-discussion-item-container__action">{__('discussion-item-actions.action.delete')}</Button>
        <Button shape="plain" className="m-discussion-item-container__action">{__('discussion-item-actions.action.reply')}</Button>
        <Button shape="plain" className="m-discussion-item-container__action">{__('discussion-item-actions.action.forward')}</Button>
        <DropdownControl
          toggle={this.dropdownId}
          className="m-discussion-item-container__action float-right"
          shape="plain"
        >
          {__('discussion-item-actions.action.more')}
        </DropdownControl>
        {this.renderMenuDropdown()}
        {this.renderTagsModal()}
      </div>
    );
  }


  renderTagsModal = () => {
    const { discussion, __ } = this.props;
    const count = discussion.tags ? discussion.tags.length : 0;
    const title = [
      __('tags.header.title'),
      (<span key="1" className="m-tags-form__count">{__('tags.header.count', { count }) }</span>),
    ];

    return (
      <Modal
        isOpen={this.state.isTagModalOpen}
        contentLabel={__('tags.header.title')}
        title={title}
        onClose={this.handleCloseTags}
      >
        <ManageTags discussion={discussion} />
      </Modal>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Swipe
        onSwipeLeft={this.handleHover}
        onSwipeRight={this.handleBlur}
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleBlur}
        className={classnames(
          'm-discussion-item-container',
          { 'm-discussion-item-container--active': this.state.isActive },
        )}
      >

        {this.renderActions()}
        {children}

      </Swipe>
    );
  }
}

export default DiscussionItemContainer;
