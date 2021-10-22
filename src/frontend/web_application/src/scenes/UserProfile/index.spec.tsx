import * as React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from 'test/server';
import { AllProviders } from 'test/providers';
import { generateUser } from 'test/fixtures/user';
import { generateContact } from 'test/fixtures/contacts';
import UserProfile from '.';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => true,
}));

describe('UserProfile', () => {
  it('renders', async () => {
    server.use(
      rest.get('/api/v1/me', (req, res, ctx) =>
        res(
          ctx.json(
            generateUser({ contact: generateContact({ given_name: 'John' }) })
          ),
          ctx.status(200)
        )
      ),
      rest.patch('/api/v2/contacts/:id', (req, res, ctx) =>
        res(ctx.json({ message: 'ok' }), ctx.status(200))
      )
    );

    render(<UserProfile />, { wrapper: AllProviders });
    await waitForElementToBeRemoved(screen.getByText('Loading …'), {
      timeout: 5000,
    });
    expect(screen.getByText('John Dœuf')).toBeVisible();

    expect(screen.getByLabelText('Given name')).toHaveValue('John');
    expect(screen.getByLabelText('Given name')).toBeDisabled();

    userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Given name')).toBeEnabled();

    userEvent.clear(screen.getByLabelText('Given name'));
    userEvent.type(screen.getByLabelText('Given name'), 'Foobar');

    userEvent.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Given name')).toBeDisabled()
    );
    expect(screen.getByLabelText('Given name')).toHaveValue('Foobar');
  });
});
