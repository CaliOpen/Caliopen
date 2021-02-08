import React from 'react';
import classnames from 'classnames';
import { getTabUrl } from '../../../../../../modules/tab';
import { URLSearchParams } from '../../../../../../modules/routing';
import { Icon } from '../../../../../../components';
import Tab from '../Tab';
import NavbarItem from '../NavbarItem';
import ItemLink from '../ItemLink';
import ItemButton from '../ItemButton';

class SearchTab extends Tab {
  render() {
    const { className, isActive, tab, routeConfig } = this.props;

    const searchParams = new URLSearchParams(tab.location.search);

    const label = routeConfig.tab.renderLabel({
      term: searchParams.get('term'),
    });

    return (
      <NavbarItem
        className={classnames('m-tab', className)}
        active={isActive}
        color="secondary"
        contentChildren={
          <ItemLink
            to={getTabUrl(tab.location)}
            title={label}
            className="m-tab__content"
          >
            <Icon className="m-tab__icon" type={routeConfig.tab.icon} />
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

export default SearchTab;
