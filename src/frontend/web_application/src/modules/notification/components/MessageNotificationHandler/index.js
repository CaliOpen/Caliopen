import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { invalidateAll } from '../../../../store/modules/message';
import { invalidate } from '../../../../store/modules/discussion';
import { messageNotificationsSelector } from '../../selectors/messageNotificationsSelector';
import Presenter from './presenter';

const mapStateToProps = (state) => ({
  notifications: messageNotificationsSelector(state),
  initialized: state.notification.initialized,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      invalidateCollections: invalidateAll,
      invalidateDiscussions: invalidate,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
