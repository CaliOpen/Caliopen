import * as React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import reactRouter from 'react-router-dom';
import { server } from 'test/server';
import { AllProviders } from 'test/providers';
import { generateContact } from 'test/fixtures/contacts';
import EditContact from './EditContact';

const mockHistory = {
  push: jest.fn(),
};

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useHistory: () => mockHistory,
}));

describe('EditContact', () => {
  it('renders', async () => {
    const id = 'abcd';
    jest.spyOn(reactRouter, 'useParams').mockReturnValue({ contactId: id });
    const apiPatch = jest.fn();
    server.use(
      rest.patch('/api/v2/contacts/:id', (req, res, ctx) => {
        apiPatch(req.body);

        return res(ctx.status(201));
      }),
      rest.get('/api/v2/contacts/:id', async (req, res, ctx) =>
        res(
          ctx.json(
            generateContact({
              contact_id: req.params.id,
              given_name: 'Fry',
              family_name: '',
            })
          ),
          ctx.status(200)
        )
      )
    );

    render(<EditContact />, {
      wrapper: AllProviders,
    });

    expect(await screen.findByText('Contact details')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Fry' })
    ).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: 'Fry' }));
    userEvent.clear(screen.getByRole('textbox', { name: 'Firstname' }));
    userEvent.type(
      screen.getByRole('textbox', { name: 'Firstname' }),
      'Bender'
    );

    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(apiPatch).toHaveBeenCalledWith({
        current_state: { given_name: 'Fry' },
        given_name: 'Bender',
      })
    );

    await waitFor(() =>
      expect(mockHistory.push).toHaveBeenCalledWith(`/contacts/${id}`)
    );
  });
});
