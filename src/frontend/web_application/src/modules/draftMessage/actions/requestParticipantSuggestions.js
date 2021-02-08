import {
  suggest,
  searchSuccess,
} from '../../../store/modules/participant-suggestions';
import { settingsSelector } from '../../settings';
import { getContact } from '../../contact';
import { formatName } from '../../../services/contact';

const getSuggestion = ({ label, address, protocol, ...opts }) => ({
  label,
  address,
  protocol,
  ...opts,
});

const createGetContactSuggestions = (format) => (contact) => {
  let suggestions = [];

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

const createExtractSuggestionsFromContacts = (getContactSuggestions) => (
  contacts
) =>
  contacts.reduce(
    (acc, contact) => [...acc, ...getContactSuggestions(contact)],
    []
  );

const getContactIdsFromSuggestions = (results) =>
  results
    .filter((result) => result.source === 'contact')
    .map((result) => result.contact_id);

const getContacts = ({ contactIds }) => (dispatch) =>
  Promise.all(
    contactIds.map((contactId) => dispatch(getContact({ contactId })))
  );

const sortResults = ({ contactSuggestions, rawSuggestions }) =>
  contactSuggestions
    .reduce((acc, suggestion) => {
      // unset participant where address is used in contactSuggestions
      const nextSuggestions = acc.filter(
        (sugg) =>
          sugg.address !== suggestion.address ||
          sugg.protocol !== suggestion.protocol ||
          !!sugg.contact_id
      );

      const suggestionIndex = nextSuggestions.findIndex(
        (sugg) => sugg.contact_id === suggestion.contact_id
      );

      if (suggestionIndex === -1) {
        return [...nextSuggestions, suggestion];
      }

      return [
        ...nextSuggestions.slice(0, suggestionIndex),
        suggestion,
        ...nextSuggestions.slice(suggestionIndex),
      ];
    }, rawSuggestions)
    // XXX: cf. empty suggestions https://github.com/CaliOpen/Caliopen/issues/1122
    .filter((suggestion) => suggestion.address)
    // deduplicate addresses
    .filter(
      (suggestion, idx, arr) =>
        idx ===
        arr.findIndex(
          (sugg) =>
            sugg.address === suggestion.address &&
            sugg.protocol === suggestion.protocol
        )
    );

export const requestParticipantSuggestions = ({ terms, context }) => async (
  dispatch,
  getState
) => {
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
  const contactIds = getContactIdsFromSuggestions(axiosResponse.payload.data);

  const contacts = await dispatch(getContacts({ contactIds }));
  const results = sortResults({
    contactSuggestions: extractSuggsFromContacts(contacts),
    rawSuggestions: axiosResponse.payload.data,
  });

  return dispatch(searchSuccess(terms, context, results));
};
