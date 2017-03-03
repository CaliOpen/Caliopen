import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { requestTags, createTag, updateTag } from '../../store/modules/tag';
import Presenter from './presenter';

const tagsSelector = state => state.tag;
const mapStateToProps = createSelector(
  [tagsSelector],
  ({ tags, isFetching }) => ({ tags, isFetching })
);
const mapDispatchToProps = dispatch => bindActionCreators({
  requestTags,
  createTag,
  updateTag,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslator()
)(Presenter);
