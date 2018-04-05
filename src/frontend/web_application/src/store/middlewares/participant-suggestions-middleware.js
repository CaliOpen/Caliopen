import { SEARCH, suggest, searchSuccess } from '../modules/participant-suggestions';
import { requestContact, REQUEST_CONTACT_SUCCESS } from '../modules/contact';
import { formatName } from '../../services/contact';
import { settingsSelector } from '../../store/selectors/settings';

const sortResults = ({ contactSuggestions, rawSuggestions }) => contactSuggestions
  .reduce((acc, suggestion) => {
    const suggestionIndex = acc.findIndex(sugg => sugg.contact_id === suggestion.contact_id);

    return [
      ...acc.slice(0, suggestionIndex),
      suggestion,
      ...acc.slice(suggestionIndex),
    ];
  }, rawSuggestions)
  .filter(suggestion => suggestion.address)
  .filter((suggestion, idx, arr) =>
    idx === arr.findIndex(sugg =>
      sugg.address === suggestion.address && sugg.protocol === suggestion.protocol));
const filterSuggestionsWithContact = results => results.filter(result => result.source === 'contact');
const extractContactFromAxios = axiosResult =>
  axiosResult.type === REQUEST_CONTACT_SUCCESS && axiosResult.payload.data;
const getContacts = ({ store, contactIds }) =>
  Promise.all(contactIds.map(contactId => store.dispatch(requestContact(contactId))))
    .then(allContactAxiosResults => allContactAxiosResults
      .map(extractContactFromAxios)
      .filter(contact => contact));
const getSuggestion = ({
  label, address, protocol, ...opts
}) => ({
  label, address, protocol, ...opts,
});
const createGetContactSuggestions = format => (contact) => {
  if (!contact.emails) {
    return [];
  }

  return contact.emails.map(email => getSuggestion({
    label: formatName({ contact, format }),
    address: email.address,
    protocol: 'email',
    contact_id: contact.contact_id,
    source: 'contact',
  }));
};

const createExtractSuggestionsFromContacts = getContactSuggestions => contacts => contacts
  .reduce((acc, contact) => [
    ...acc,
    ...getContactSuggestions(contact),
  ], []);

export const handleSearchAction = async ({ store, action }) => {
  if (action.type !== SEARCH) {
    return;
  }

  const state = store.getState();
  const { contact_display_format: contactDisplayFormat } = settingsSelector(state);
  const getContactSuggestions = createGetContactSuggestions(contactDisplayFormat);
  const extractSuggsFromContacts = createExtractSuggestionsFromContacts(getContactSuggestions);

  const { terms, context } = action.payload;
  const successSuggestAction = await store.dispatch(suggest(terms, context));
  const contactIds = filterSuggestionsWithContact(successSuggestAction.payload.data)
    .map(result => result.contact_id);
  const contacts = await getContacts({ store, contactIds });
  const results = sortResults({
    contactSuggestions: extractSuggsFromContacts(contacts),
    rawSuggestions: successSuggestAction.payload.data,
  });
  store.dispatch(searchSuccess(terms, context, results));
};

export default store => next => (action) => {
  const result = next(action);

  handleSearchAction({ store, action });

  return result;
};
