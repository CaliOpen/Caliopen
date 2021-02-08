import { createSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { requestProviders } from '../../../../store/modules/provider';
import { providerStateSelector } from '../../../../store/selectors/provider';
import Presenter from './presenter';

const mapStateToProps = createSelector(
  [providerStateSelector],
  ({ isFetching, didInvalidate, providers }) => ({
    isFetching,
    didInvalidate,
    providers /* FIXME sort */,
  })
);
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestProviders,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
