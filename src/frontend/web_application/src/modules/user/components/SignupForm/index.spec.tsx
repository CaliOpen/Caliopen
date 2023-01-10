import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import * as React from 'react';
import { AllProviders } from 'test/providers';
import { server } from 'test/server';
import SignupForm from '.';

jest.mock('src/modules/device', () => ({
  ...(jest.requireActual('src/modules/device') as any),
  withDevice: () => (C) =>
    function (props) {
      return <C {...props} />;
    },
}));

describe('scene - Signup', () => {
  it('render', () => {
    render(<SignupForm />, { wrapper: AllProviders });

    expect(
      screen.getByRole('textbox', { name: 'Username:' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Rescue email address:/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'I understand and agree' })
    ).toBeInTheDocument();
  });

  it('handle username usernameAvailability not available', async () => {
    server.use(
      rest.get<any, { username: string }>(
        '/api/v2/username/isAvailable',
        async (req, res, ctx) =>
          res(
            ctx.json({ available: false, username: req.params.username }),
            ctx.status(200)
          )
      )
    );

    render(<SignupForm />, { wrapper: AllProviders });

    expect(
      screen.getByRole('textbox', { name: 'Username:' })
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Username:' }),
      'exists'
    );

    // Force blur field
    await userEvent.click(screen.getByLabelText('Password:'));

    expect(
      await screen.findByText('We are sorry, this username is not available')
    ).toBeInTheDocument();
  });

  it('handle username usernameAvailability errors', async () => {
    server.use(
      rest.get<any, { username: string }>(
        '/api/v2/username/isAvailable',
        async (req, res, ctx) =>
          res(ctx.text('Unexpected error occured'), ctx.status(500))
      )
    );

    render(<SignupForm />, { wrapper: AllProviders });

    expect(
      screen.getByRole('textbox', { name: 'Username:' })
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Username:' }),
      'exists'
    );

    // Force blur field
    await userEvent.click(screen.getByLabelText('Password:'));

    expect(
      await screen.findByText('Request failed with status code 500')
    ).toBeInTheDocument();
  });
});
