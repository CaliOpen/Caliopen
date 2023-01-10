import { AppDispatch, GetState } from 'src/types';
import { Contact } from 'src/modules/contact/types';
import {
  suggest,
  searchSuccess,
  Context,
  Suggestion,
  SuggestionPayload,
  ParticipantSuggestionPayload,
} from 'src/store/modules/participant-suggestions';
import { formatName, getContact } from 'src/modules/contact';
import { settingsSelector } from '../../settings';

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

const createGetContactSuggestions = (format: string) => (contact: Contact) => {
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

const createExtractSuggestionsFromContacts =
  (getContactSuggestions: (contact: Contact) => Suggestion[]) =>
  (contacts: Contact[]) =>
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

export const requestParticipantSuggestions =
  (terms: string, context: Context) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const { contact_display_format: contactDisplayFormat } = settingsSelector(
      getState()
    ).settings;
    const getContactSuggestions =
      createGetContactSuggestions(contactDisplayFormat);
    const extractSuggsFromContacts = createExtractSuggestionsFromContacts(
      getContactSuggestions
    );

    const axiosResponse = await dispatch(suggest(terms, context));
    const contactIds: string[] = getContactIdsFromSuggestions(
      // @ts-ignore: dispatch didn't transform axios action in response
      axiosResponse.payload.data
    );

    // @ts-ignore: dispatch thunk
    const contacts: Contact[] = await dispatch(getContacts(contactIds));
    // @ts-ignore: dispatch didn't transform axios action in response
    const suggestionPayloads: SuggestionPayload[] = axiosResponse.payload.data;
    const contactSuggestions = extractSuggsFromContacts(
      contacts.filter(Boolean)
    );

    const participantSuggestion = suggestionPayloads
      .filter((payload) => payload.source === 'participant')
      // deduplicate addresses
      .filter(
        (payload: ParticipantSuggestionPayload) =>
          !contactSuggestions.some(
            (contactSuggestion) =>
              payload.protocol === contactSuggestion.protocol &&
              payload.address === contactSuggestion.address
          )
      )

      .map((payload: ParticipantSuggestionPayload) => getSuggestion(payload));

    const results = [...contactSuggestions, ...participantSuggestion];

    return dispatch(searchSuccess(terms, context, results));
  };
