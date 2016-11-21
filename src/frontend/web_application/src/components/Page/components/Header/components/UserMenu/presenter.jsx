import React, { Component, PropTypes } from 'react';
import Link from '../../../../../Link';
import Icon from '../../../../../Icon';
import VerticalMenu, { VerticalMenuTextItem, VerticalMenuItem, Separator } from '../../../../../VerticalMenu';
import Dropdown, { DropdownController } from '../../../../../Dropdown';

class Presenter extends Component {
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

    return (
      <div>
        <DropdownController
          toggle="co-user-menu"
          className="float-right"
          modifiers={{ expanded: true }}
        >
          <Icon type="user" />&nbsp;
          <span className="show-for-small-only">{this.props.user.name}</span>&nbsp;
          <Icon type={this.state.isDropdownOpen ? 'caret-up' : 'caret-down'} />
        </DropdownController>
        <Dropdown id="co-user-menu" position="bottom" closeOnClick onToggle={onDropdownToggle}>
          <VerticalMenu>
            <VerticalMenuTextItem>{this.props.user.name}</VerticalMenuTextItem>
            <Separator />
            <VerticalMenuItem>
              <Link to="/account" modifiers={{ button: true, expanded: true }}>{'header.menu.account'}</Link>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Link to="/auth/logout" modifiers={{ button: true, expanded: true }}>{'header.menu.signout'}</Link>
            </VerticalMenuItem>
          </VerticalMenu>
        </Dropdown>
      </div>
    );
  }
}

Presenter.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Presenter;
