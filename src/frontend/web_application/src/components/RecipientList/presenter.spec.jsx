import React from 'react';
import { shallow } from 'enzyme';
import RecipientList from './presenter';

describe('component RecipientList', () => {
  const noop = str => str;
  const requiredProps = {
    // discussionId: 'simpleDraft',
    internalId: 'simpleDraft',
    search: noop,
    setSearchTerms: noop,
    __: noop,
  };

  /* eslint-disable max-len */
  const recipients = [
    { contact_ids: [], name: 'foo bar', protocol: { identifier: '+033 000 000 000', type: 'sms', privacy_index: 10 } },
    { contact_ids: [], name: 'bar bar rian', protocol: { identifier: 'barbar@rian.tld', type: 'email', privacy_index: 10 } },
    { contact_ids: [], name: 'John doerémifasol', protocol: { identifier: 'john.doe', type: 'facebook', privacy_index: 10 } },
  ];
  /* eslint-enable max-len */

  it('render', () => {
    const comp = shallow(
      <RecipientList {...requiredProps} />
    );
    const inst = comp.instance();

    expect(inst.addParticipant).toBeInstanceOf(Function);
  });

  describe('remove a recipient', () => {
    it('should remove a recipient', () => {
      const props = {
        recipients: [...recipients],
        onRecipientsChange: jest.fn(),
      };

      const comp = shallow(
        <RecipientList {...requiredProps} {...props} />
      );
      const inst = comp.instance();

      inst.removeRecipient(recipients[1]);
      expect(props.onRecipientsChange).toHaveBeenCalledWith([recipients[0], recipients[2]]);
    });

    it('should edit a recipient eventually', () => {
      const props = {
        recipients: [...recipients],
        onRecipientsChange: jest.fn(),
      };

      const comp = shallow(
        <RecipientList {...requiredProps} {...props} />
      );
      const inst = comp.instance();

      inst.eventuallyEditRecipient();

      expect(props.onRecipientsChange).toHaveBeenCalledWith([recipients[0], recipients[1]]);
    });

    it('should not remove a recipient eventually', () => {
      const props = {
        recipients: [...recipients],
        onRecipientsChange: jest.fn(),
      };

      const comp = shallow(
        <RecipientList {...requiredProps} {...props} />
      );
      const inst = comp.instance();

      inst.setState({ searchTerms: 'foobar' });
      inst.eventuallyEditRecipient();

      expect(props.onRecipientsChange).not.toHaveBeenCalledWith();
    });
  });

  describe('add a recipient', () => {
    it('should add an unknown recipient', () => {
      const props = {
        recipients: [],
        onRecipientsChange: jest.fn(),
      };

      const comp = shallow(
        <RecipientList {...requiredProps} {...props} />
      );
      const inst = comp.instance();

      const address = 'foo@bar.tld';

      inst.addUnknownParticipant(address);
      expect(props.onRecipientsChange).toHaveBeenCalled();
      expect(props.onRecipientsChange.mock.calls[0][0][0].address).toEqual(address);
      expect(props.onRecipientsChange.mock.calls[0][0][0].protocol).toEqual('email');
    });

    it('should add an unknown recipient with unknown protocol', () => {
      const props = {
        recipients: [],
        onRecipientsChange: jest.fn(),
      };

      const comp = shallow(
        <RecipientList {...requiredProps} {...props} />
      );
      const inst = comp.instance();

      const address = 'foo@';

      inst.addUnknownParticipant(address);
      expect(props.onRecipientsChange).toHaveBeenCalled();
      expect(props.onRecipientsChange.mock.calls[0][0][0].address).toEqual(address);
      expect(props.onRecipientsChange.mock.calls[0][0][0].protocol).toEqual('unknown');
    });
  });
});
