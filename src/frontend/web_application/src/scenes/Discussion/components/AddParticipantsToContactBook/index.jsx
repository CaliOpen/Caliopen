import React, { Component, Fragment, createRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withI18n } from '@lingui/react';
import {
  ActionBarButton,
  Link,
  Icon,
  Dropdown,
  withDropdownControl,
  VerticalMenu,
  VerticalMenuItem,
  TextBlock,
} from '../../../../components';
import { getParticipantsExceptUser } from '../../../../services/message';
import { withUser } from '../../../../modules/user';

import './add-participants-dropdown.scss';

const DropdownControl = withDropdownControl(ActionBarButton);

@withI18n()
@withUser()
class AddParticipantsToContactBook extends Component {
  static propTypes = {
    className: PropTypes.string,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    userState: PropTypes.shape({
      user: PropTypes.shape({}),
    }).isRequired,
    // we only need one message of a discussion
    // - for one-to-many: since it has all the participant of the discussion (and the protocol
    // cannot be mixed)
    // - for one-to-one: if the participant is not in the contact book it will be always a different
    // discussion
    message: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    className: undefined,
  };

  dropdownControlRef = createRef();

  getUnknownParticipants = () => {
    const {
      message,
      userState: { user },
    } = this.props;

    return getParticipantsExceptUser(message, user).filter(
      (participant) => !participant.contact_ids
    );
  };

  render() {
    const { i18n, className } = this.props;
    const participants = this.getUnknownParticipants();

    if (participants.length === 0) {
      return null;
    }

    return (
      <Fragment>
        <DropdownControl
          ref={this.dropdownControlRef}
          display="inline"
          noDecoration
          className={classnames(className)}
          title={i18n._('message.action.add-participant-to-contacts', null, {
            defaults: 'Add a participant to the contact book',
          })}
        >
          <Icon type="address-book" /> <Icon type="plus" />
        </DropdownControl>
        <Dropdown
          dropdownControlRef={this.dropdownControlRef}
          isMenu
          className="m-add-participants-dropdown"
        >
          <VerticalMenu>
            {participants.map((participant) => (
              <VerticalMenuItem
                key={`${participant.protocol}_${participant.address}`}
                className="m-dropdown-unknown-participants__participant"
              >
                <Link
                  button
                  expanded
                  to={`/contact-association/${participant.protocol}/${participant.address}?label=${participant.label}`}
                  title={i18n._('message.action.add-to-contacts', null, {
                    defaults: 'Add to contact book',
                  })}
                >
                  <TextBlock
                    inline
                    className="m-add-participants-dropdown__label"
                  >
                    {participant.label}
                  </TextBlock>{' '}
                  <Icon type="address-book" /> <Icon type="plus" />
                </Link>
              </VerticalMenuItem>
            ))}
          </VerticalMenu>
        </Dropdown>
      </Fragment>
    );
  }
}

export default AddParticipantsToContactBook;
