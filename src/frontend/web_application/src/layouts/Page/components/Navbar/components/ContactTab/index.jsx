import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Icon } from '../../../../../../components';
import { getTabUrl } from '../../../../../../modules/tab';
import Tab from '../Tab';
import NavbarItem from '../NavbarItem';
import ItemLink from '../ItemLink';
import ItemButton from '../ItemButton';

const contactState = (state) => state.contact;
const tabSelector = (state, props) => props.tab;
const routeConfigSelector = (state, props) => props.routeConfig;

const mapStateToProps = createSelector(
  [contactState, tabSelector, routeConfigSelector],
  (discussionState, tab, routeConfig) => ({
    contact:
      discussionState.contactsById[
        tab.getMatch({ routeConfig }).params.contactId
      ],
  })
);

@connect(mapStateToProps)
class ContactTab extends Tab {
  render() {
    const { className, isActive, tab, contact, routeConfig } = this.props;

    const label = routeConfig.tab.renderLabel({ contact });

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
            <Icon type="address-book" className="m-tab__icon" rightSpaced />
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

export default ContactTab;
