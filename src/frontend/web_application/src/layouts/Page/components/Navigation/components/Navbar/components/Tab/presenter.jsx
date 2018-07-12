import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NavbarItem from '../NavbarItem';
import { Icon } from '../../../../../../../../components/';
import { getTabUrl } from '../../../../../../../../services/tab';
import ItemButton from '../ItemButton';
import ItemLink from '../ItemLink';

import './style.scss';

class Tab extends Component {
  static propTypes = {
    className: PropTypes.string,
    tab: PropTypes.shape({}).isRequired,
    onRemove: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    last: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  constructor(props) {
    super(props);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleRemove() {
    this.props.onRemove(this.props.tab);
  }

  render() {
    const {
      className, tab, isActive, last,
    } = this.props;

    return (
      <NavbarItem
        className={className}
        active={isActive}
        contentChildren={(
          <ItemLink to={getTabUrl(tab)} title={tab.label}>
            <Icon className="m-tab__icon" type={tab.icon || 'dot-circle'} />
            {tab.label}
          </ItemLink>
        )}
        actionChildren={<ItemButton onClick={this.handleRemove} icon="remove" />}
        last={last}
      />
    );
  }
}

export default Tab;
