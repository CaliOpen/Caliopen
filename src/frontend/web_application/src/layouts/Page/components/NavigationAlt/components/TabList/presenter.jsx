import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab } from '../../../Navigation/components/Navbar';

class TabList extends Component {
  static propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.shape({})),
    requestTabs: PropTypes.func.isRequired,
    removeTab: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
    tabs: [],
  };

  constructor(props) {
    super(props);
    this.horizontalScrollCallback = null;
  }

  componentDidMount() {
    this.props.requestTabs();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.tabs !== newProps.tabs && this.horizontalScrollCallback) {
      this.horizontalScrollCallback();
    }
  }

  getTabIdentifier = ({ pathname, search, hash }) => `${pathname}${search}${hash}`;

  handleTabsChange(cb) {
    this.horizontalScrollCallback = cb;
  }

  render() {
    const { className, tabs, removeTab } = this.props;
    const isLast = tab => tabs.indexOf(tab) === (tabs.length - 1);

    return (
      <ul className={className}>
        {tabs.map(tab => (
          <li key={this.getTabIdentifier(tab)} data-toggle="left_off_canvas"><Tab tab={tab} onRemove={removeTab} last={isLast(tab)} /></li>
        ))}
      </ul>
    );
  }
}

export default TabList;
