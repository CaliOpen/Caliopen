import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { currentTabSelector } from '../store/selectors/tab';

const mapStateToProps = createSelector(
  [currentTabSelector],
  currentTab => ({
    currentTab,
  })
);

const withCurrentTab = () => Component => connect(mapStateToProps)(Component);

export { withCurrentTab };
