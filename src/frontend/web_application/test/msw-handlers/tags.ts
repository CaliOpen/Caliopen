import { rest } from 'msw';
import tags from '../fixtures/tags/data.json';

export const tagsHandlers = [
  rest.get('/api/v2/tags', (req, res, ctx) => {
    return res(ctx.json({ tags, total: tags.length }), ctx.status(200));
  }),
];
