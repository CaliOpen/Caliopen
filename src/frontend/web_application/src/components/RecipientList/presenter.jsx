import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import Dropdown from '../Dropdown';
import Button from '../Button';
import Icon from '../Icon';
import VerticalMenu, { VerticalMenuItem } from '../VerticalMenu';
import protocolsConfig, { ASSOC_PROTOCOL_ICON } from '../../services/protocols-config';
import { addEventListener } from '../../services/event-manager';
import Recipient from './components/Recipient';
import './style.scss';

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

const makeParticipant = ({
  address,
  protocol = 'email',
  label,
  contact_ids,
  type = 'To',
}) => ({
  address,
  protocol,
  label,
  contact_ids,
  type,
});

const getStateFromProps = props => ({
  recipients: props.recipients,
});

class RecipientList extends Component {
  static propTypes = {
    internalId: PropTypes.string,
    recipients: PropTypes.arrayOf(PropTypes.shape()),
    onRecipientsChange: PropTypes.func,
    setSearchTerms: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.shape({})),
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    internalId: undefined,
    contacts: [],
    recipients: [],
    searchResults: [],
    onRecipientsChange: () => {},
  };

  state = {
    recipients: [],
    searchTerms: '',
    activeSearchResultIndex: 0,
    searchOpened: false,
  };

  componentWillMount() {
    this.setState(getStateFromProps(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps));
  }

  focusSearch() {
    this.searchInputRef.focus();
  }

  handleRemoveRecipient = (participant) => {
    this.removeRecipient(participant);
  };

  handleSearchChange = (ev) => {
    const { setSearchTerms, internalId } = this.props;
    if (!internalId) {
      return;
    }

    this.setState({
      searchTerms: ev.target.value,
      searchOpened: true,
    }, () => {
      setSearchTerms({ internalId, searchTerms: this.state.searchTerms });

      if (this.state.searchTerms.length >= 3) {
        return this.search(this.state.searchTerms);
      }

      if (!this.state.searchTerms.length) {
        return this.resetSearch();
      }

      return undefined;
    });
  };

  search = debounce(this.props.search, 1 * 1000, { leading: false, trailing: true });

  handleClickRecipientList = (ev) => {
    if (ev.target === ev.currentTarget) {
      this.focusSearch();
    }
  };

  handleSearchInputFocus = () => {
    this.setState({ searchOpened: true });
    this.unsubscribeInputBlur = addEventListener('click', (ev) => {
      if (ev.target === this.searchInputRef) {
        return;
      }

      if (this.state.searchTerms.length > 0) {
        this.addUnknownParticipant(this.state.searchTerms);
        this.resetSearch();
        this.setState({ searchOpened: false });
      }

      this.unsubscribeInputBlur();
    });
  }

  handleSearchKeydown = (ev) => {
    const { which: keyCode, key } = ev;

    if ([KEY.ENTER, KEY.UP, KEY.DOWN].indexOf(keyCode) !== -1) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    if (keyCode === KEY.UP &&
      this.props.searchResults.length > 0 &&
      this.state.activeSearchResultIndex > 0) {
      this.setState(prevState => ({
        activeSearchResultIndex: prevState.activeSearchResultIndex - 1,
      }));
    }

    if (keyCode === KEY.DOWN &&
      this.props.searchResults.length > 0 &&
      this.state.activeSearchResultIndex < this.props.searchResults.length - 1) {
      this.setState(prevState => ({
        activeSearchResultIndex: prevState.activeSearchResultIndex + 1,
      }));
    }

    if (keyCode === KEY.BACKSPACE) {
      if (this.state.searchTerms.length === 0) {
        ev.preventDefault();
      }
      this.eventuallyEditRecipient();
    }

    if (keyCode === KEY.ENTER && this.props.searchResults.length > 0) {
      this.makeAddKnownParticipant(
        this.props.searchResults[this.state.activeSearchResultIndex]
      )();
      this.resetSearch();
    } else if (
      (
        [KEY.ENTER, KEY.TAB].indexOf(keyCode) !== -1 ||
        [KEY.COMMA, KEY.SEMICOLON].indexOf(key) !== -1
      ) && this.state.searchTerms.length > 0
    ) {
      this.addUnknownParticipant(this.state.searchTerms);
      this.resetSearch();
      this.setState({ searchOpened: false });
    }

    if ([KEY.COMMA, KEY.SEMICOLON].indexOf(key) !== -1) {
      ev.preventDefault();
    }
  }

  addParticipant(participant) {
    const compareParticipants = (a, b) => a.address === b.address && a.protocol === b.protocol;

    this.setState(prevState => ({
      recipients: [
        ...prevState.recipients
          .filter(previousParticipant => !compareParticipants(previousParticipant, participant)),
        participant,
      ],
    }), () => {
      this.resetSearch();
      this.props.onRecipientsChange(this.state.recipients);
    });
  }

  makeAddKnownParticipant(identity) {
    return () => {
      const { address } = identity;
      this.addParticipant(makeParticipant({
        address,
        label: address,
        contact_ids: identity.contact_id ? [identity.contact_id] : [],
      }));
    };
  }

  addUnknownParticipant(address) {
    const protocol = Object.keys(protocolsConfig).reduce((previous, current) => {
      if (!previous && protocolsConfig[current].default) {
        return current;
      }

      const { regexp } = protocolsConfig[current];

      if (protocolsConfig[previous].default && regexp && regexp.test(address)) {
        return current;
      }

      return previous;
    });

    this.addParticipant(makeParticipant({
      address,
      protocol,
      label: address,
    }));
  }

  eventuallyEditRecipient() {
    if (this.state.searchTerms.length === 0 && this.state.recipients.length) {
      this.editRecipient(
        this.state.recipients[this.state.recipients.length - 1]
      );
    }
  }

  editRecipient(participant) {
    this.removeRecipient(participant);
    this.setState({
      searchTerms: participant.address,
      searchOpened: true,
    });
  }

  resetSearch() {
    this.setState({
      searchTerms: '',
      activeSearchResultIndex: 0,
    });
  }

  removeRecipient(participant) {
    this.setState(
      prevState => ({
        recipients: prevState.recipients.filter(curr => curr !== participant),
      }),
      () => {
        this.props.onRecipientsChange(this.state.recipients);
      }
    );
  }

  renderSearchResult(identity, index, results) {
    const isContact = identity.source === 'contact';
    // results are sorted by contact
    const hasLabel = isContact &&
      index === results.findIndex(result => result.contact_id === identity.contact_id);

    const infoClassName = classnames(
      {
        'm-recipient-list__search-result-info': hasLabel,
        'm-recipient-list__search-result-title': !hasLabel,
      },
    );

    return (
      <Button
        display="expanded"
        onClick={this.makeAddKnownParticipant(identity)}
        className="m-recipient-list__search-result"
        color={index === this.state.activeSearchResultIndex ? 'active' : null}
      >
        {hasLabel && (
          <span className="m-recipient-list__search-result-title">
            {isContact && <Icon type="user" rightSpaced />}
            {identity.label}
          </span>
        )}

        <span className={infoClassName}>
          <Icon
            type={ASSOC_PROTOCOL_ICON[identity.protocol]}
            aria-label={identity.protocol}
            rightSpaced
          />
          <i>{identity.address}</i>
        </span>
      </Button>
    );
  }

  render() {
    const componentId = uuidV1();
    const dropdownId = uuidV1();
    const { __, searchResults } = this.props;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div id={componentId} onClick={this.handleClickRecipientList} ref={(el) => { this.recipientListRef = el; }} role="presentation" className="m-recipient-list">
        { !this.state.recipients.length && (
          <span className="m-recipient-list__placeholder">
            {__('messages.compose.form.to.label')}
          </span>
        )}
        {this.state.recipients.map(participant => (
          <Recipient
            key={`${participant.address}_${participant.protocol}`}
            className="m-recipient-list__recipient"
            participant={participant}
            onRemove={this.handleRemoveRecipient}
          />
        ))}
        <div className="m-recipient-list__search">
          <input
            ref={(el) => { this.searchInputRef = el; }}
            className="m-recipient-list__search-input"
            onChange={this.handleSearchChange}
            value={this.state.searchTerms}
            onKeyDown={this.handleSearchKeydown}
            onFocus={this.handleSearchInputFocus}
            onBlur={this.handleSearchInputBlur}
          />
          <Dropdown
            id={dropdownId}
            show={this.state.searchTerms ?
              (searchResults.length > 0 && this.state.searchOpened) : false
            }
            closeOnClickExceptRefs={[this.searchInputRef, this.recipientListRef]}
            isMenu
          >
            <VerticalMenu>
              {searchResults.map((identity, index) => (
                <VerticalMenuItem key={`${identity.address}_${identity.protocol}`}>
                  {this.renderSearchResult(identity, index, searchResults)}
                </VerticalMenuItem>
              ))}
            </VerticalMenu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default RecipientList;
