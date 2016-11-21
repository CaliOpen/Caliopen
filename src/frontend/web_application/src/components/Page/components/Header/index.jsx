import React, { Component } from 'react';
import { Link } from 'react-router';
import CoLink from '../../../Link';
import Button from '../../../Button';
import Icon from '../../../Icon';
import Presenter from './presenter';
import SearchField from './components/SearchField';
import UserMenu from './components/UserMenu';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchAsDropdown: false,
    };
    this.handleClickToggleSearchAsDropdown = this.handleClickToggleSearchAsDropdown.bind(this);
    this.isAuthenticated = true;
  }

  handleClickToggleSearchAsDropdown() {
    this.setState({
      searchAsDropdown: !this.state.searchAsDropdown,
    });
  }

  render() {
    return (
      <Presenter
        brand={children => (<Link to="/">{children}</Link>)}
        searchAsDropdownToggler={(
          <Button
            aria-label="header.menu.toggle-search-form"
            onClick={this.handleClickToggleSearchAsDropdown}
          ><Icon type="search" /></Button>
        )}
        searchAsDropdown={this.state.searchAsDropdown}
        search={<SearchField />}
        user={this.isAuthenticated ? <UserMenu /> : <CoLink to="/auth/login" modifiers={{ button: true }}>{'header.menu.signin'}</CoLink>}
      />
    );
  }
}

export default Header;
