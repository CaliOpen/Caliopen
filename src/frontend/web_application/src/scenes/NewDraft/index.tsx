import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCloseTab, useCurrentTab } from '../../modules/tab';
import { withScrollManager } from '../../modules/scroll';
import { getMessage, Message } from '../../modules/message';
import DraftMessage from './components/DraftMessage';
import DraftDiscussion from './components/DraftDiscussion';
import './style.scss';

interface NewDraftProps {
  scrollManager: {
    scrollToTarget: () => string;
  };
  location: {
    hash: string;
  };
}
function NewDraft(props: NewDraftProps) {
  const dispatch = useDispatch();
  const history = useHistory();
  const closeTab = useCloseTab();
  const tab = useCurrentTab();
  const { messageId } = useParams<{ messageId?: string }>();

  const handleCloseTab = () => closeTab(tab);

  // TODO: rollback pour garder le redirect si c'est pas draft
  const redirectDiscussion = (message: Message) => {
    history.push(`/discussions/${message.discussion_id}#${message.message_id}`);
    handleCloseTab();
  };

  React.useEffect(() => {
    if (messageId) {
      // @ts-ignore
      dispatch(getMessage({ messageId })).then(
        (message) => {
          if (!message.is_draft) {
            redirectDiscussion(message);
          }
        },
        () => {
          // actually new draft, nothing to do
        }
      );
    }
  }, [messageId]);

  const handleSent = (message) => {
    redirectDiscussion(message);
  };

  const getHash = () => {
    const { location } = props;

    return location.hash ? location.hash.slice(1) : null;
  };

  const {
    scrollManager: { scrollToTarget },
  } = props;

  if (!messageId) {
    return <Redirect to={`/messages/${uuidv4()}`} />;
  }

  const hash = getHash();

  return (
    <div className="s-new-draft">
      <DraftMessage
        scrollToMe={hash === 'compose' ? scrollToTarget : undefined}
        className="s-new-draft__form"
        messageId={messageId}
        onDeleteMessageSuccessfull={handleCloseTab}
        onSent={handleSent}
      />
      <DraftDiscussion
        className="s-new-draft__discussion"
        messageId={messageId}
      />
    </div>
  );
}

export default withScrollManager()(NewDraft);
