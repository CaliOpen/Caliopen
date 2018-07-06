/* eslint-disable */
import React, { Component } from 'react';
import { Button, Icon } from '../../../../components/';
import ParticipantsIconLetter from '../../../../components/ParticipantsIconLetter';
import { getTabUrl } from '../../../../services/tab';
import { NavbarItem, ItemLink, ItemButton } from '../../../Page/components/Navigation/components/Navbar';
import './style.scss';

class Tab extends Component {
  render() {
    const { tab, isActive, last } = this.props;

    switch (true) {
      case tab.pathname === '/':
        return (
          <NavbarItem
            className="tab tab-timeline"
            active={isActive}
            contentChildren={(
              <ItemLink to={getTabUrl(tab)} title={tab.label}>
                <Icon className="m-tab__icon" type={tab.icon || 'dot-circle-o'} />
              </ItemLink>
            )}
            last={last}
          />
        );
      case tab.pathname === '/contacts/':
      case tab.pathname.startsWith('/settings/'):
      case tab.pathname.startsWith('/contacts/'):
      case tab.pathname.startsWith('/user/'):
        return (
          <NavbarItem
            className="tab"
            active={isActive}
            contentChildren={(
              <ItemLink to={getTabUrl(tab)} title={tab.label}>
                <Icon className="m-tab__icon" type={tab.icon || 'dot-circle-o'} />
                {tab.label}
              </ItemLink>
            )}
            actionChildren={isActive ? <ItemButton onClick={this.handleRemove} icon="remove" /> : null}
            last={last}
          />
        );
      case tab.pathname.startsWith('/discussions/'):
        return (
          <NavbarItem
            className="tab"
            active={isActive}
            contentChildren={(
              <ItemLink to={getTabUrl(tab)} title={tab.label}>
                <ParticipantsIconLetter className="tab__icon" labels={tab.label.split(' ')} />
                {tab.label}
              </ItemLink>
            )}
            actionChildren={isActive ? <ItemButton onClick={this.handleRemove} icon="remove" /> : null}
            last={last}
          />
        );
      default:
        throw 'unable to render tab';
    };
  }
}

export default Tab;
