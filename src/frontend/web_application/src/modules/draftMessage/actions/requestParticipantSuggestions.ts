import {
  suggest,
  searchSuccess,
  Context,
  Suggestion,
  SuggestionPayload,
  ParticipantSuggestionPayload,
} from '../../../store/modules/participant-suggestions';
import { settingsSelector } from '../../settings';
import { getContact } from '../../contact';
import { formatName } from '../../../services/contact';
import { AppDispatch, GetState } from 'src/types';
import { ContactPayload } from 'src/modules/contact/types';
import { differenceWith } from 'lodash';

const getSuggestion = ({
  label,
  address,
  protocol,
  source,
  ...opts
}): Suggestion => ({
  label,
  address,
  protocol,
  source,
  ...opts,
});

const createGetContactSuggestions = (format: string) => (
  contact: ContactPayload
) => {
  let suggestions: Suggestion[] = [];

  if (contact.emails) {
    suggestions = [
      ...suggestions,
      ...contact.emails.map((email) =>
        getSuggestion({
          label: formatName({ contact, format }),
          address: email.address,
          protocol: 'email',
          contact_id: contact.contact_id,
          source: 'contact',
        })
      ),
    ];
  }

  if (contact.identities) {
    suggestions = [
      ...suggestions,
      ...contact.identities.map((identity) =>
        getSuggestion({
          label: formatName({ contact, format }),
          address: identity.name,
          protocol: identity.type,
          contact_id: contact.contact_id,
          source: 'contact',
        })
      ),
    ];
  }

  return suggestions;
};

const createExtractSuggestionsFromContacts = (
  getContactSuggestions: (contact: ContactPayload) => Suggestion[]
) => (contacts: ContactPayload[]) =>
  contacts.reduce<Suggestion[]>(
    (acc, contact) => [...acc, ...getContactSuggestions(contact)],
    []
  );

const getContactIdsFromSuggestions = (results) =>
  results
    .filter((result) => result.source === 'contact')
    .map((result) => result.contact_id);

const getContacts = (contactIds: string[]) => (dispatch: AppDispatch) =>
  Promise.all(
    // @ts-ignore: dispatch thunk action
    contactIds.map((contactId) => dispatch(getContact({ contactId })))
  );

export const requestParticipantSuggestions = (
  terms: string,
  context: Context
) => async (dispatch: AppDispatch, getState: GetState) => {
  const { contact_display_format: contactDisplayFormat } = settingsSelector(
    getState()
  ).settings;
  const getContactSuggestions = createGetContactSuggestions(
    contactDisplayFormat
  );
  const extractSuggsFromContacts = createExtractSuggestionsFromContacts(
    getContactSuggestions
  );

  const axiosResponse = await dispatch(suggest(terms, context));
  const contactIds: string[] = getContactIdsFromSuggestions(
    // @ts-ignore: dispatch didn't transform axios action in response
    axiosResponse.payload.data
  );

  // @ts-ignore: dispatch thunk
  const contacts: ContactPayload[] = await dispatch(getContacts(contactIds));
  // @ts-ignore: dispatch didn't transform axios action in response
  const suggestionPayloads: SuggestionPayload[] = axiosResponse.payload.data;
  const contactSuggestions = extractSuggsFromContacts(contacts.filter(Boolean));

  const participantSuggestion = suggestionPayloads
    .filter((payload) => payload.source === 'participant')
    // deduplicate addresses
    .filter((payload: ParticipantSuggestionPayload) => {
      return !contactSuggestions.some((contactSuggestion) => {
        return (
          payload.protocol === contactSuggestion.protocol &&
          payload.address === contactSuggestion.address
        );
      });
    })

    .map((payload: ParticipantSuggestionPayload) => getSuggestion(payload));

  const results = [...contactSuggestions, ...participantSuggestion];

  return dispatch(searchSuccess(terms, context, results));
};
