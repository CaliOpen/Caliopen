import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Icon } from '../../../../../../components';
import { getTabUrl, Tab as TabModel } from '../../../../../../modules/tab';
import ItemLink from '../ItemLink';
import ItemButton from '../ItemButton';
import NavbarItem from '../NavbarItem';
import './style.scss';

class Tab extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    onRemove: PropTypes.func,
    isActive: PropTypes.bool.isRequired,
    tab: PropTypes.instanceOf(TabModel).isRequired,
    routeConfig: PropTypes.shape({
      tab: PropTypes.shape({
        renderLabel: PropTypes.func,
        icon: PropTypes.string,
      }),
    }).isRequired,
  };

  static defaultProps = {
    className: undefined,
    onRemove: () => {
      // noop
    },
  };

  handleRemove = () => {
    const { tab, onRemove } = this.props;
    onRemove({ tab });
  };

  render() {
    const {
      className,
      isActive,
      routeConfig,
      tab: { location },
    } = this.props;

    return (
      <NavbarItem
        className={classnames('m-tab', className)}
        active={isActive}
        color="secondary"
        contentChildren={
          <ItemLink
            to={getTabUrl(location)}
            title={routeConfig.tab.renderLabel()}
            className="m-tab__content"
          >
            <Icon className="m-tab__icon" type={routeConfig.tab.icon} />
            {routeConfig.tab.renderLabel()}
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

export default Tab;
