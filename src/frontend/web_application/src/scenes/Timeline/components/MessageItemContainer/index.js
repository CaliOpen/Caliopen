import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from 'lingui-react';
import { replyToMessage } from '../../../../store/modules/message';
import { deleteMessage } from '../../../../modules/message';
import { clearDraft } from '../../../../store/modules/draft-message';
import Presenter from './presenter';

const onDeleteMessage = ({ message }) => dispatch =>
  dispatch(deleteMessage({ message }))
    .then(() => {
      if (!message.is_draft) {
        return undefined;
      }

      return dispatch(clearDraft({ internalId: message.discussion_id }));
    });

const mapDispatchToProps = dispatch => bindActionCreators({
  replyToMessage,
  deleteMessage: onDeleteMessage,
}, dispatch);

export default compose(
  connect(null, mapDispatchToProps),
  withI18n()
)(Presenter);
