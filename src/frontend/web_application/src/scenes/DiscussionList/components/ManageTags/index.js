import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { updateDiscussion } from '../../../../store/modules/discussion';
import Presenter from './presenter';

const mapDispatchToProps = dispatch => bindActionCreators({
  onDiscussionChange: updateDiscussion,
}, dispatch);

export default compose(
  connect(null, mapDispatchToProps),
  withTranslator()
)(Presenter);
