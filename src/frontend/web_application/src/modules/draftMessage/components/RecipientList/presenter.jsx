import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import { Trans } from '@lingui/react';
import {
  Dropdown, Button, Icon, VerticalMenu, VerticalMenuItem,
} from '../../../../components';
import protocolsConfig, { ASSOC_PROTOCOL_ICON } from '../../../../services/protocols-config';
import { addEventListener } from '../../../../services/event-manager';
import Recipient from '../Recipient';
import { isValidRecipient } from '../../services/isValidRecipient';
import { Participant } from '../../../message';
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

class RecipientList extends Component {
  static propTypes = {
    className: PropTypes.string,
    internalId: PropTypes.string,
    recipients: PropTypes.arrayOf(PropTypes.shape({})),
    onRecipientsChange: PropTypes.func.isRequired,
    setSearchTerms: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.shape({})),
    identity: PropTypes.shape({}),
  };

  static defaultProps = {
    className: undefined,
    internalId: undefined,
    recipients: [],
    searchResults: [],
    identity: undefined,
  };

  state = {
    searchTerms: '',
    activeSearchResultIndex: 0,
    searchOpened: false,
  };

  search = debounce(this.props.search, 1 * 1000, { leading: false, trailing: true });

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
        return this.search({ terms: this.state.searchTerms });
      }

      if (!this.state.searchTerms.length) {
        return this.resetSearch();
      }

      return undefined;
    });
  };

  handleClickRecipientList = (ev) => {
    if (ev.target === ev.currentTarget) {
      this.focusSearch();
    }
  };

  handleSearchInputFocus = () => {
    if (this.state.searchOpened) {
      return;
    }
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
      this.makeAddKnownParticipant(this.props.searchResults[this.state.activeSearchResultIndex])();
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

  focusSearch() {
    this.searchInputRef.focus();
  }

  addParticipant(participant) {
    const compareParticipants = (a, b) => a.address === b.address && a.protocol === b.protocol;

    const { recipients } = this.props;
    const nextRecipients = [
      ...recipients
        .filter(previousParticipant => !compareParticipants(previousParticipant, participant)),
      participant,
    ];

    this.resetSearch();
    this.props.onRecipientsChange(nextRecipients);
  }

  makeAddKnownParticipant(identity) {
    return () => {
      const { address, protocol, label } = identity;
      this.addParticipant(new Participant({
        address,
        label: label || address,
        contact_ids: identity.contact_id ? [identity.contact_id] : [],
        protocol,
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

    this.addParticipant(new Participant({
      address,
      protocol,
      label: address,
    }));
  }

  eventuallyEditRecipient() {
    const { recipients } = this.props;
    if (this.state.searchTerms.length === 0 && recipients.length) {
      this.editRecipient(recipients[recipients.length - 1]);
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
    const { recipients } = this.props;
    const nextRecipients = recipients.filter(curr => curr !== participant);
    this.props.onRecipientsChange(nextRecipients);
  }

  renderSearchResult(identity, index, results) {
    const isContact = identity.source === 'contact';
    // results are sorted by contact
    const hasLabel = isContact &&
      index === results.findIndex(result => result.contact_id === identity.contact_id);

    const infoClassName = classnames({
      'm-recipient-list__search-result-info': hasLabel,
      'm-recipient-list__search-result-title': !hasLabel,
    });

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
    // useful ?
    const componentId = uuidV1();
    const {
      searchResults, className, identity, recipients,
    } = this.props;

    return (
      <div
        id={componentId}
        onClick={this.handleClickRecipientList}
        ref={(el) => { this.recipientListRef = el; }}
        role="presentation"
        className={classnames('m-recipient-list', className)}
      >
        {!recipients.length && (
          <span className="m-recipient-list__placeholder">
            <Trans id="messages.compose.form.to.label">To</Trans>
          </span>
        )}
        {recipients.map(participant => (
          <Recipient
            key={`${participant.address}_${participant.protocol}`}
            className="m-recipient-list__recipient"
            participant={participant}
            onRemove={this.handleRemoveRecipient}
            isValid={isValidRecipient({ recipient: participant, identity })}
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
            className="m-recipient-list__dropdown"
            show={this.state.searchTerms ?
              (searchResults.length > 0 && this.state.searchOpened) : false
            }
            closeOnClick="doNotClose"
            isMenu
          >
            <VerticalMenu>
              {searchResults.map((ident, index) => (
                <VerticalMenuItem key={`${ident.address}_${ident.protocol}`}>
                  {this.renderSearchResult(ident, index, searchResults)}
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
