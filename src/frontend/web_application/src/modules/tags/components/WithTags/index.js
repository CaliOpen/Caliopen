import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { requestTags } from '../../actions/requestTags';
import { stateSelector } from '../../store/selectors';

import Presenter from './presenter';

// FIXME
const mapStateToProps = createSelector(
  [stateSelector],
  ({ tags, isFetching, isInvalidated }) => ({
    tags,
    isFetching,
    isInvalidated,
  })
);
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestTags,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
