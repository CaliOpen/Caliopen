import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { getNewContact } from 'src/modules/contact';
import { server } from 'test/server';
import { AllProviders } from 'test/providers';
import NewContact from './NewContact';

const mockHistory = {
  push: jest.fn(),
};

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useHistory: () => mockHistory,
}));

describe('NewContact', () => {
  it('renders', async () => {
    const id = 'abcd';
    const contactPayload = getNewContact();
    const apiPost = jest.fn();
    server.use(
      rest.post('/api/v2/contacts', (req, res, ctx) => {
        apiPost(req.body);

        return res(
          ctx.json({ location: `/api/v2/contacts/${id}`, contact_id: id }),
          ctx.status(200)
        );
      })
    );

    render(<NewContact />, {
      wrapper: AllProviders,
    });
    expect(screen.getByText('Contact details')).toBeInTheDocument();

    userEvent.type(
      screen.getByRole('textbox', { name: 'Firstname' }),
      'Bender'
    );

    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Loading …')).toBeInTheDocument();

    await waitForElementToBeRemoved(screen.queryByText('Loading …'));
    expect(apiPost).toHaveBeenCalledWith({
      ...contactPayload,
      given_name: 'Bender',
    });

    expect(mockHistory.push).toHaveBeenCalledWith(`/contacts/${id}`);
  });
});
