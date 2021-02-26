import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useContacts } from 'src/modules/contact';
import { filterIdentities } from 'src/modules/draftMessage/services/filterIdentities';
import { useIdentities } from 'src/modules/identity';
import { messageSelector, getMessage } from 'src/modules/message';
import { useUser } from 'src/modules/user';
import { IDraftMessageFormData } from 'src/modules/draftMessage/types';

const EMPTY_ARRAY = [];

export function useAvailableIdentities(
  draft: undefined | IDraftMessageFormData
) {
  const dispatch = useDispatch();
  const { identities } = useIdentities();
  const { user } = useUser();
  const { contacts } = useContacts();
  const parentMessage = useSelector((state) =>
    messageSelector(state, { messageId: draft?.parent_id })
  );
  const [loaded, setLoaded] = React.useState<boolean>(false);
  React.useEffect(() => {
    (async function fetch() {
      if (draft && draft.parent_id && !parentMessage && !loaded) {
        await dispatch(getMessage({ messageId: draft.parent_id }));
        setLoaded(true);
      }
    })();
  }, [draft, loaded, parentMessage]);

  if (!identities) {
    return EMPTY_ARRAY;
  }

  if (!user) {
    return EMPTY_ARRAY;
  }

  return filterIdentities({
    identities,
    user,
    contacts,
    parentMessage,
  });
}
