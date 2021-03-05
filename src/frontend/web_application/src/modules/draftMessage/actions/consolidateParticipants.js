import { requestContactIdsForURI } from 'src/modules/contact/store/reducer';
import { tryCatchAxiosAction } from '../../../services/api-client';

const consolidateParticipant = (participant) => async (dispatch) => ({
  ...participant,
  contact_ids: [
    ...(
      await tryCatchAxiosAction(() =>
        dispatch(
          requestContactIdsForURI({
            protocol: participant.protocol,
            address: participant.address,
          })
        )
      )
    ).contacts.map((contact) => contact.contact_id),
  ],
});

export const consolidateParticipants = (participants) => (dispatch) =>
  Promise.all(
    participants.map(async (participant) =>
      participant.contact_ids && participant.contact_ids.length > 0
        ? participant
        : dispatch(consolidateParticipant(participant))
    )
  );
