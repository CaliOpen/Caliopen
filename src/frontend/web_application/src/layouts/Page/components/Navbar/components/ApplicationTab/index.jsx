import React from 'react';
import classnames from 'classnames';
import { Icon } from '../../../../../../components';
import Tab from '../Tab';
import NavbarItem from '../NavbarItem';
import ItemLink from '../ItemLink';
import { getTabUrl } from '../../../../../../modules/tab';
import './application-tab.scss';

class ApplicationTab extends Tab {
  render() {
    const {
      className,
      isActive,
      tab: { location },
      routeConfig,
    } = this.props;

    return (
      <NavbarItem
        className={classnames('m-application-tab', className)}
        active={isActive}
        color="contrasted"
        contentChildren={
          <ItemLink
            to={getTabUrl(location)}
            title={routeConfig.tab.renderLabel()}
          >
            <Icon type={routeConfig.tab.icon} />
          </ItemLink>
        }
      />
    );
  }
}

export default ApplicationTab;
