import { requestPublicKeys } from '../../../store/modules/public-key';
import { tryCatchAxiosAction } from '../../../services/api-client';

export const fetchRemoteKeys = (contactIds) => (dispatch) =>
  Promise.all(
    contactIds.map((contactId) =>
      tryCatchAxiosAction(() => dispatch(requestPublicKeys({ contactId })))
    )
  );
