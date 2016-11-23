import React, { Component, PropTypes } from 'react';
import { withTranslator } from '@gandi/react-translate';
import { Link } from '../Navbar';
import BaseLink from '../../../../../Link';
import Icon from '../../../../../Icon';
import Dropdown, { DropdownController } from '../../../../../Dropdown';
import VerticalMenu, { VerticalMenuItem } from '../../../../../VerticalMenu';
import './style.scss';

@withTranslator()
class Presenter extends Component {
  static propTypes = {
    applications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    currentApplication: PropTypes.shape({
      route: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    __: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
    };
  }

  render() {
    const onDropdownToggle = () => {
      this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
    };

    const { __ } = this.props;

    return (
      <div className="m-application-switcher">
        <Link to={this.props.currentApplication.route}>
          <Icon type={this.props.currentApplication.icon} /> {__(`header.menu.${this.props.currentApplication.name}`)}
        </Link>
        <DropdownController
          toggle="co-application-switcher"
          className="dropdown-float-right m-application-switcher__toggler"
        >
          <span className="show-for-sr">{__('application_switcher.action.choose')}</span>
          <Icon type={this.state.isDropdownOpen ? 'caret-up' : 'caret-down'} />
        </DropdownController>
        <Dropdown
          id="co-application-switcher"
          closeOnClick
          raw
          position="bottom"
          className="m-application-switcher__dropdown"
          onToggle={onDropdownToggle}
        >
          <VerticalMenu>
            {
              this.props.applications.filter(app => app !== this.props.currentApplication)
                .map((application, key) => (
                  <VerticalMenuItem key={key}>
                    <BaseLink to={application.route} modifiers={{ button: true, expanded: true }}>
                      <Icon type={application.icon} /> {__(`header.menu.${application.name}`)}
                    </BaseLink>
                  </VerticalMenuItem>
                ))
            }
          </VerticalMenu>
        </Dropdown>
      </div>
    );
  }
}

export default Presenter;
