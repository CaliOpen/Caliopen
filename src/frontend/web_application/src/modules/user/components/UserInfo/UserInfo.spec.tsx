import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { AllProviders } from 'test/providers';
import { server } from 'test/server';
import { generateUser } from 'test/fixtures/user';
import { settings } from 'test/msw-handlers/settings';
import WithUser from '../WithUser';
import UserInfo from './index';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => true,
}));

// XXX: use a hook instead
function Comp() {
  return (
    <WithUser
      // @ts-ignore
      render={(user) => (user ? <UserInfo user={user} /> : 'loading')}
    />
  );
}

describe('component UserInfo', () => {
  const user = generateUser();
  beforeEach(() => {
    server.use(
      rest.get('/api/v1/me', (req, res, ctx) =>
        res(ctx.json(user), ctx.status(200))
      ),
      rest.get('/api/v1/settings', (req, res, ctx) =>
        res(ctx.json(settings), ctx.status(200))
      )
    );
  });

  it('render', async () => {
    render(<Comp />, {
      wrapper: AllProviders,
    });

    // TODO: rm (after using hooks)
    //  Force re-render due to With<Thing> fetching
    await waitFor(() => screen.findByText('loading'));
    await waitFor(() => screen.findByText(user.name || 'fail'));
  });
});
