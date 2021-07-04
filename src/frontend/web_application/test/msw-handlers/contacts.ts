import { rest } from 'msw';
import contacts from '../fixtures/contacts/data.json';

export const contactsHandlers = [
  rest.get('/api/v2/contacts', (req, res, ctx) =>
    res(ctx.json({ contacts, total: contacts.length }), ctx.status(200))
  ),
];
