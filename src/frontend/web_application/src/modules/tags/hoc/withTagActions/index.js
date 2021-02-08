import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { createTag } from '../../actions/createTag';
import { requestTags } from '../../actions/requestTags';
import { updateTag } from '../../actions/updateTag';
import { deleteTag } from '../../actions/deleteTag';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createTag,
      requestTags,
      updateTag,
      deleteTag,
    },
    dispatch
  );

export default () => compose(connect(null, mapDispatchToProps));
