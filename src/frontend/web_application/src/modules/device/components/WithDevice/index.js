import { createSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deviceStateSelector } from '../../../../store/selectors/device';
import { requestDevice } from '../../actions/requestDevice';
import Presenter from './presenter';

const mapStateToProps = createSelector(
  [deviceStateSelector],
  ({ isGenerated }) => ({ isGenerated })
);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestDevice,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
