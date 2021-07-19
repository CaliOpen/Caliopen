import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { AllProviders } from 'test/providers';
import RecipientList from './RecipientList';
import { Recipient } from '../types';
import userEvent from '@testing-library/user-event';

// jest.mock('src/modules/draftMessage/components/RecipientList', () => ({
//   isAuthenticated: () => true,
// }));

console.log({ RecipientList });

describe('RecipientList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const recipients: Recipient[] = [
    {
      contact_ids: [],
      address: 'foo bar',
      protocol: 'unknown',
      type: 'To',
    },
    {
      address: 'barbar@rian.tld',
      contact_ids: ['1234'],
      label: 'bar bar rian',
      protocol: 'email',
      type: 'To',
    },
    {
      address: 'john.doe',
      contact_ids: ['4666'],
      label: 'John doerémifasol',
      protocol: 'facebook',
      type: 'To',
    },
  ];
  it('render', async () => {
    const handleRecipientChange = jest.fn();
    render(<RecipientList onRecipientsChange={handleRecipientChange} />, {
      wrapper: AllProviders,
    });

    expect(screen.getByText('To:')).toBeVisible();
  });

  describe('remove a recipient', () => {
    it('should remove a recipient', () => {
      const handleRecipientChange = jest.fn();
      render(
        <RecipientList
          onRecipientsChange={handleRecipientChange}
          recipients={recipients}
        />,
        {
          wrapper: AllProviders,
        }
      );

      expect(screen.getByText(recipients[0].address));

      // userEvent.click(screen.getByText(recipients[0].address));

      //       const props = {
      //         recipients: [...recipients],
      //         onRecipientsChange: jest.fn(),
      //       };

      //       const comp = shallow(<RecipientList {...requiredProps} {...props} />);
      //       const inst = comp.instance();

      //       inst.removeRecipient(recipients[1]);
      //       expect(props.onRecipientsChange).toHaveBeenCalledWith([
      //         recipients[0],
      //         recipients[2],
      //       ]);
    });

    it.todo('should edit a recipient eventually');
    // , () => {
    //       const props = {
    //         recipients: [...recipients],
    //         onRecipientsChange: jest.fn(),
    //       };
    //       const comp = shallow(<RecipientList {...requiredProps} {...props} />);
    //       const inst = comp.instance();
    //       inst.eventuallyEditRecipient();
    //       expect(props.onRecipientsChange).toHaveBeenCalledWith([
    //         recipients[0],
    //         recipients[1],
    //       ]);
    // });

    it.todo('should not remove a recipient eventually');
    // , () => {
    //       const props = {
    //         recipients: [...recipients],
    //         onRecipientsChange: jest.fn(),
    //       };
    //       const comp = shallow(<RecipientList {...requiredProps} {...props} />);
    //       const inst = comp.instance();
    //       inst.setState({ searchTerms: 'foobar' });
    //       inst.eventuallyEditRecipient();
    //       expect(props.onRecipientsChange).not.toHaveBeenCalledWith();
    // });
  });

  describe('add a recipient', () => {
    it.todo('should add an unknown recipient');
    // , () => {
    //   const props = {
    //     recipients: [],
    //     onRecipientsChange: jest.fn(),
    //   };

    //   const comp = shallow(<RecipientList {...requiredProps} {...props} />);
    //   const inst = comp.instance();

    //   const address = 'foo@bar.tld';

    //   inst.addUnknownParticipant(address);
    //   expect(props.onRecipientsChange).toHaveBeenCalled();
    //   expect(props.onRecipientsChange.mock.calls[0][0][0].address).toEqual(
    //     address
    //   );
    //   expect(props.onRecipientsChange.mock.calls[0][0][0].protocol).toEqual(
    //     'email'
    //   );
    // });

    it.todo('should add an unknown recipient with unknown protocol');
    // , () => {
    //   const props = {
    //     recipients: [],
    //     onRecipientsChange: jest.fn(),
    //   };

    //   const comp = shallow(<RecipientList {...requiredProps} {...props} />);
    //   const inst = comp.instance();

    //   const address = 'foo@';

    //   inst.addUnknownParticipant(address);
    //   expect(props.onRecipientsChange).toHaveBeenCalled();
    //   expect(props.onRecipientsChange.mock.calls[0][0][0].address).toEqual(
    //     address
    //   );
    //   expect(props.onRecipientsChange.mock.calls[0][0][0].protocol).toEqual(
    //     'unknown'
    //   );
    // });
  });
});
