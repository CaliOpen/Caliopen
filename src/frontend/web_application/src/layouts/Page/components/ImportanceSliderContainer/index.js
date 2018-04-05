import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { setImportanceLevel } from '../../../../store/modules/importance-level';

const mapStateToProps = createSelector(
  [state => state.importanceLevel],
  importanceLevel => ({
    importanceLevelRange: importanceLevel.range,
  })
);
const mapDispatchToProps = dispatch => bindActionCreators({ setImportanceLevel }, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
