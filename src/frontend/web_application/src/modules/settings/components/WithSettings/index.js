import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { requestSettings } from '../../../../store/modules/settings';
import { settingsStateSelector } from '../../../../store/selectors/settings';

const mapStateToProps = createSelector(
  [settingsStateSelector],
  ({ settings, isFetching, isInvalidated }) => ({ settings, isFetching, isInvalidated })
);
const mapDispatchToProps = dispatch => bindActionCreators({
  requestSettings,
}, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
