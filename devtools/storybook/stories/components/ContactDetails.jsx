import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { object, boolean } from '@kadira/storybook-addon-knobs';
import ContactDetails from '../../src/components/ContactDetails';
import { Code, ComponentWrapper } from '../presenters';

const Presenter = () => {
    const contact = {
      title: 'Foobar',
      emails: [
        { address: 'abc@bar.tld', type: 'work', email_id: 'foo1' },
        { address: 'def@isprimary.tld', is_primary: true, type: 'home' },
        { address: 'abc@notbar.tld' },
      ],
      phones: [
        { number: '+33678912345' },
      ],
      ims: [
        { address: 'abc@bar.tld', type: 'work' },
      ],
      addresses: [
        { street: '42 is the answer', postal_code: '12345', city: 'Everywhere', country: 'on The Internet', label: 'An address', type: 'work' },
      ],
    };
    const remoteIdentities = [
      { identity_type: 'email', identity_id: 'foo1', is_fetching: true, connected: true },
    ];

    const translate = str => str;
    const props = {
      allowConnectRemoteEntity: boolean('allowConnectRemoteEntity', false),
    };

    return (
      <div>
        <ComponentWrapper>
          <ContactDetails
            contact={object('contact', contact)}
            remoteIdentities={object('remoteIdentities', remoteIdentities)}
            onConnectRemoteIdentity={action('connect remote identity')}
            onDisconnectRemoteIdentity={action('disconnect remote identity')}
            onAddContactDetail={action('add contact detail')}
            onDeleteContactDetail={action('delete contact detail')}
            __={translate}
            {...props}
          />
        </ComponentWrapper>
        <Code>
          {`
import ContactDetails, { SIZE_SMALL } from './src/components/ContactDetails';

export default () => (
  <ContactDetails
    contact={contact}
    remoteIdentities={remoteIdentities}
    onConnectRemoteIdentity={action('connect remote identity')}
    onDisconnectRemoteIdentity={action('disconnect remote identity')}
    onAddContactDetail={action('add contact detail')}
    onDeleteContactDetail={action('delete contact detail')}
    allowConnectRemoteEntity
    __={translate}
  />
);
          `}
        </Code>
      </div>
    );
};

export default Presenter;
