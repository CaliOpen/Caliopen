import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { AllProviders } from 'test/providers';
import { server } from 'test/server';
import { user } from 'test/msw-handlers/user';
import { settings } from 'test/msw-handlers/settings';
import WithUser from '../WithUser';
import UserInfo from './index';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => true,
}));

// XXX: use a hook instead
const Comp = () => (
  <WithUser render={(user) => (user ? <UserInfo user={user} /> : 'loading')} />
);

describe('component UserInfo', () => {
  beforeEach(() => {
    server.use(
      rest.get('/api/v1/me', (req, res, ctx) => {
        return res(ctx.json(user), ctx.status(200));
      }),
      rest.get('/api/v1/settings', (req, res, ctx) => {
        return res(ctx.json(settings), ctx.status(200));
      })
    );
  });

  it('render', async () => {
    render(<Comp />, {
      wrapper: AllProviders,
    });

    // TODO: rm (after using hooks)
    //  Force re-render due to With<Thing> fetching
    await waitFor(() => screen.findByText('loading'));
    await waitFor(() => screen.findByText(user.name));
  });
});
