import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import { Trans } from '@lingui/react';
import {
  Dropdown,
  Button,
  Icon,
  VerticalMenu,
  VerticalMenuItem,
  withDropdownControl,
} from 'src/components';
import protocolsConfig, {
  ASSOC_PROTOCOL_ICON,
} from 'src/services/protocols-config';
import { addEventListener } from 'src/services/event-manager';
import { getKey, Suggestion } from 'src/store/modules/participant-suggestions';
import { IIdentity } from 'src/modules/identity/types';
import { RootState } from 'src/store/reducer';
import { requestParticipantSuggestions } from '../actions/requestParticipantSuggestions';
import { isValidRecipient } from '../services/isValidRecipient';
import { Participant } from '../../message';
import { Recipient } from '../types';
import RecipientItem from './Recipient';
import './RecipientList.scss';

export const KEY = {
  BACKSPACE: 8,
  TAB: 9,
  COMMA: ',',
  SEMICOLON: ';',
  ENTER: 13,
  ESC: 27,
  UP: 38,
  DOWN: 40,
};

const EMPTY_SEARCH_RESULTS: Suggestion[] = [];
const participantSuggestionsSelector = (state: RootState) =>
  state.participantSuggestions;

const searchResultsSelector = (
  state: RootState,
  { searchTerms, identity }: { searchTerms: string; identity?: IIdentity }
) => {
  if (!searchTerms || !identity) {
    return EMPTY_SEARCH_RESULTS;
  }

  const { resultsByKey } = participantSuggestionsSelector(state);

  return resultsByKey[getKey(searchTerms)] || EMPTY_SEARCH_RESULTS;
};

const InputDropdownControl = withDropdownControl(
  React.forwardRef<HTMLInputElement>((props, ref) => (
    <input ref={ref} {...props} />
  ))
);

interface Props {
  className?: string;
  messageId?: string;
  recipients?: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
  identity?: IIdentity;
}

function RecipientList({
  className,
  messageId,
  recipients = [],
  identity,
  onRecipientsChange,
}: Props): JSX.Element {
  const dispatch = useDispatch();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerms, setSearchTerms] = React.useState('');
  const [activeSearchResultIndex, setActiveSearchResultIndex] =
    React.useState(0);
  const [searchOpened, setSearchOpened] = React.useState(false);

  const resetSearch = () => {
    setSearchTerms('');
    setActiveSearchResultIndex(0);
  };

  const addRecipient = (recipient: Recipient) => {
    const compareRecipients = (a: Recipient, b: Recipient) =>
      a.address === b.address && a.protocol === b.protocol;

    const nextRecipients = [
      ...recipients.filter(
        (previousRecipient) => !compareRecipients(previousRecipient, recipient)
      ),
      recipient,
    ];

    onRecipientsChange(nextRecipients);
  };

  const addUnknownParticipant = (address: string) => {
    const getProtocol = (search: string) =>
      Object.keys(protocolsConfig).reduce((previous, current) => {
        if (!previous && protocolsConfig[current].default) {
          return current;
        }

        const { regexp } = protocolsConfig[current];

        if (
          protocolsConfig[previous].default &&
          regexp &&
          regexp.test(search)
        ) {
          return current;
        }

        return previous;
      });

    const protocol = identity ? identity.protocol : getProtocol(address);

    addRecipient(
      new Participant({
        address,
        protocol,
        label: address,
      })
    );
  };

  React.useEffect(() => {
    const unsubscribeClickEvent = addEventListener(
      'click',
      (ev: React.SyntheticEvent<HTMLElement>) => {
        const searchClick =
          searchInputRef.current === ev.target ||
          searchInputRef.current?.contains(ev.target as Node);

        if (searchClick) {
          setSearchOpened((prev) => !prev);
          return;
        }

        // Note that suggestions onClick stop propation, so it never comes here when a suggestion is clicked

        if (searchTerms.length > 0) {
          addUnknownParticipant(searchTerms);
          resetSearch();
          setSearchOpened(false);
        }
      }
    );

    return () => unsubscribeClickEvent();
  }, [searchTerms]);

  const searchResults = useSelector<RootState, Suggestion[]>((state) =>
    searchResultsSelector(state, { searchTerms, identity })
  ).filter(
    // filter already added recipients
    (suggestion) =>
      !recipients.some(
        (recipient) =>
          recipient.protocol === suggestion.protocol &&
          recipient.address === suggestion.address
      )
  );

  const doSearch = React.useCallback(
    debounce<(terms: string) => any>(
      (terms: string) =>
        dispatch(requestParticipantSuggestions(terms, 'msg_compose')),
      1 * 1000,
      {
        leading: false,
        trailing: true,
      }
    ),
    []
  );

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  const handleClickRecipientList = (ev) => {
    if (ev.target === ev.currentTarget) {
      focusSearch();
    }
  };

  const addKnownParticipant = (suggestion: Suggestion) => {
    const { address, protocol, label } = suggestion;
    addRecipient(
      new Participant({
        address,
        label: label || address,
        contact_ids: suggestion.contact_id ? [suggestion.contact_id] : [],
        protocol,
      })
    );
  };

  const removeRecipient = (recipient: Recipient) => {
    const nextRecipients = recipients.filter((curr) => curr !== recipient);
    onRecipientsChange(nextRecipients);
  };

  const editRecipient = (recipient: Recipient) => {
    removeRecipient(recipient);
    setSearchTerms(recipient.address);
    setSearchOpened(true);
  };

  const eventuallyEditRecipient = () => {
    if (searchTerms.length === 0 && recipients.length > 0) {
      editRecipient(recipients[recipients.length - 1]);
    }
  };

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = (
    ev
  ) => {
    if (!messageId) {
      return;
    }

    const { value } = ev.target;

    if (!value.length) {
      resetSearch();
      return;
    }

    if (value.length >= 3) {
      doSearch(value);
    }

    setSearchTerms(value);
  };

  const handleSearchKeydown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const { which: keyCode, key } = ev;

    if ([KEY.ENTER, KEY.UP, KEY.DOWN].indexOf(keyCode) !== -1) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    if (
      keyCode === KEY.UP &&
      searchResults.length > 0 &&
      activeSearchResultIndex > 0
    ) {
      setActiveSearchResultIndex((prev) => prev - 1);
    }

    if (
      keyCode === KEY.DOWN &&
      searchResults.length > 0 &&
      activeSearchResultIndex < searchResults.length - 1
    ) {
      setActiveSearchResultIndex((prev) => prev + 1);
    }

    if (keyCode === KEY.BACKSPACE) {
      if (searchTerms.length === 0) {
        ev.preventDefault();
      }
      eventuallyEditRecipient();
    }

    if (keyCode === KEY.ENTER && searchResults.length > 0) {
      addKnownParticipant(searchResults[activeSearchResultIndex]);
      resetSearch();
      setSearchOpened(false);
      return;
    }

    if (
      ([KEY.ENTER, KEY.TAB].indexOf(keyCode) !== -1 ||
        [KEY.COMMA, KEY.SEMICOLON].indexOf(key) !== -1) &&
      searchTerms.length > 0
    ) {
      addUnknownParticipant(searchTerms);
      resetSearch();
      setSearchOpened(false);
      return;
    }

    if ([KEY.COMMA, KEY.SEMICOLON].indexOf(key) !== -1) {
      ev.preventDefault();
    }
  };

  const renderSearchResult = (suggestion: Suggestion, index: number) => {
    const isContact = suggestion.source === 'contact';
    // searchResults are sorted by contact
    const hasLabel =
      isContact &&
      index ===
        searchResults.findIndex(
          (result) => result.contact_id === suggestion.contact_id
        );

    const infoClassName = classnames({
      'm-recipient-list__search-result-info': hasLabel,
      'm-recipient-list__search-result-title': !hasLabel,
    });

    return (
      <Button
        display="expanded"
        onClick={(ev) => {
          ev.stopPropagation();
          addKnownParticipant(suggestion);
          resetSearch();
          setSearchOpened(false);
        }}
        className="m-recipient-list__search-result"
        color={index === activeSearchResultIndex ? 'active' : undefined}
      >
        {hasLabel && (
          <span className="m-recipient-list__search-result-title">
            {isContact && <Icon type="user" rightSpaced />}
            {suggestion.label}
          </span>
        )}

        <span className={infoClassName}>
          <Icon
            type={ASSOC_PROTOCOL_ICON[suggestion.protocol]}
            aria-label={suggestion.protocol}
            rightSpaced
          />
          <i>{suggestion.address}</i>
        </span>
      </Button>
    );
  };

  return (
    <div
      onClick={handleClickRecipientList}
      role="presentation"
      className={classnames('m-recipient-list', className)}
    >
      {!recipients.length && (
        <span className="m-recipient-list__placeholder">
          <Trans id="messages.compose.form.to.label" message="To:" />
        </span>
      )}
      {recipients.map((participant) => (
        <RecipientItem
          key={`${participant.address}_${participant.protocol}`}
          className="m-recipient-list__recipient"
          participant={participant}
          onRemove={removeRecipient}
          isValid={isValidRecipient({ recipient: participant, identity })}
        />
      ))}
      <div className="m-recipient-list__search">
        <InputDropdownControl
          ref={searchInputRef}
          className="m-recipient-list__search-input"
          onChange={handleSearchChange}
          value={searchTerms}
          onKeyDown={handleSearchKeydown}
        />
        <Dropdown
          id="dropdown-recipient-list"
          dropdownControlRef={searchInputRef}
          className="m-recipient-list__dropdown"
          show={searchTerms ? searchResults.length > 0 && searchOpened : false}
          closeOnClick="doNotClose"
          isMenu
          onToggle={setSearchOpened}
        >
          <VerticalMenu>
            {searchResults.map((ident, index: number) => (
              <VerticalMenuItem key={`${ident.address}_${ident.protocol}`}>
                {renderSearchResult(ident, index)}
              </VerticalMenuItem>
            ))}
          </VerticalMenu>
        </Dropdown>
      </div>
    </div>
  );
}

export default RecipientList;
