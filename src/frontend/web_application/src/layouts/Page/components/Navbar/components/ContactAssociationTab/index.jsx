import React from 'react';
import classnames from 'classnames';
import { Icon } from '../../../../../../components';
import { getTabUrl } from '../../../../../../modules/tab';
import Tab from '../Tab';
import NavbarItem from '../NavbarItem';
import ItemLink from '../ItemLink';
import ItemButton from '../ItemButton';

class ContactAssociationTab extends Tab {
  render() {
    const { className, isActive, tab, routeConfig } = this.props;

    const { label, address } = tab.getMatch({ routeConfig }).params;
    const tabLabel = routeConfig.tab.renderLabel({ label, address });

    return (
      <NavbarItem
        className={classnames('m-tab', className)}
        active={isActive}
        contentChildren={
          <ItemLink
            to={getTabUrl(tab.location)}
            title={tabLabel}
            className="m-tab__content"
          >
            <Icon type="address-book" className="tab__icon" rightSpaced />
            {tabLabel}
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

export default ContactAssociationTab;
