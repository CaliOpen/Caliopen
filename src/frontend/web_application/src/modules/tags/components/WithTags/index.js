import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { requestTags } from '../../actions/requestTags';
import { tagSelector } from '../../../../store/selectors/tag';

import Presenter from './presenter';

const mapStateToProps = createSelector(
  [tagSelector],
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
