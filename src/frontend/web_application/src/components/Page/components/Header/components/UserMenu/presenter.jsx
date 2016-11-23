import React, { Component, PropTypes } from 'react';
import { withTranslator } from '@gandi/react-translate';
import Link from '../../../../../Link';
import Icon from '../../../../../Icon';
import VerticalMenu, { VerticalMenuTextItem, VerticalMenuItem, Separator } from '../../../../../VerticalMenu';
import Dropdown, { DropdownController } from '../../../../../Dropdown';

@withTranslator()
class Presenter extends Component {
  static propTypes = {
    user: PropTypes.shape({}).isRequired,
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

    const { user, __ } = this.props;

    return (
      <div>
        <DropdownController
          toggle="co-user-menu"
          className="float-right"
          modifiers={{ expanded: true }}
        >
          <Icon type="user" />&nbsp;
          <span className="show-for-small-only">{user.name}</span>&nbsp;
          <Icon type={this.state.isDropdownOpen ? 'caret-up' : 'caret-down'} />
        </DropdownController>
        <Dropdown id="co-user-menu" position="bottom" closeOnClick onToggle={onDropdownToggle}>
          <VerticalMenu>
            <VerticalMenuTextItem>{user.name}</VerticalMenuTextItem>
            <Separator />
            <VerticalMenuItem>
              <Link to="/account" modifiers={{ button: true, expanded: true }}>{__('header.menu.account')}</Link>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Link to="/auth/logout" modifiers={{ button: true, expanded: true }}>{__('header.menu.signout')}</Link>
            </VerticalMenuItem>
          </VerticalMenu>
        </Dropdown>
      </div>
    );
  }
}

export default Presenter;
