import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { AvatarLetter } from '../../../../../../modules/avatar';
import { getTabUrl } from '../../../../../../modules/tab';
import Tab from '../Tab';
import NavbarItem from '../NavbarItem';
import ItemLink from '../ItemLink';
import ItemButton from '../ItemButton';

const discussionStateSelector = (state) => state.discussion;
const tabSelector = (state, props) => props.tab;
const routeConfigSelector = (state, props) => props.routeConfig;

const mapStateToProps = createSelector(
  [discussionStateSelector, tabSelector, routeConfigSelector],
  (discussionState, tab, routeConfig) => ({
    discussion:
      discussionState.discussionsById[
        tab.getMatch({ routeConfig }).params.discussionId
      ],
  })
);

@connect(mapStateToProps)
class DiscussionTab extends Tab {
  render() {
    const { className, isActive, tab, routeConfig, discussion } = this.props;

    const label = routeConfig.tab.renderLabel({ discussion });

    return (
      <NavbarItem
        className={classnames('m-tab', className)}
        active={isActive}
        contentChildren={
          <ItemLink
            to={getTabUrl(tab.location)}
            title={label}
            className="m-tab__content"
          >
            {discussion && (
              <AvatarLetter className="m-tab__icon" word={label} />
            )}
            {label}
          </ItemLink>
        }
        actionChildren={
          <ItemButton
            onClick={this.handleRemove}
            icon="remove"
            className="m-tab__action"
          />
        }
      />
    );
  }
}

export default DiscussionTab;
