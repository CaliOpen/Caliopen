import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import { locationSelector } from '../../../../../../../../store/selectors/router';
import Presenter from './presenter';

const getRouteConfig = ({ pathname, search, hash }) => ({ pathname, search, hash });
const tabsSelector = (state, props) => props.tab;

const mapStateToProps = createSelector(
  [tabsSelector, locationSelector],
  (tab, location) => ({
    isActive: location === undefined || isEqual(getRouteConfig(tab), getRouteConfig(location)),
  })
);

export default connect(mapStateToProps)(Presenter);
