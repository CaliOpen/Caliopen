import { rest } from 'msw';
import user from '../fixtures/user/data.json';

export const userHandlers = [
  rest.get('/api/v1/me', (req, res, ctx) => {
    return res(ctx.json(user), ctx.status(200));
  }),
];
