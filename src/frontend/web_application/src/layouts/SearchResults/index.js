import { createSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import Presenter from './presenter';

const routePathnameSelector = state => state.router.location && state.router.location.pathname;

const mapStateToProps = createSelector(
  [routePathnameSelector],
  pathname => ({ pathname })
);

export default compose(
  connect(mapStateToProps),
  withTranslator()
)(Presenter);
