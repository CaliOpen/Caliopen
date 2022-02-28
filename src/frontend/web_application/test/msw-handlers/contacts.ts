import { rest } from 'msw';
import contacts from '../fixtures/contacts/data.json';

export const contactsHandlers = [
  rest.get('/api/v2/contacts', (req, res, ctx) =>
    res(ctx.json({ contacts, total: contacts.length }), ctx.status(200))
  ),
  rest.get('/api/v2/contacts/:id', (req, res, ctx) => {
    const found = contacts.find(
      (contact) => contact.contact_id === req.params.id
    );

    if (found) {
      return res(ctx.json(contacts[0]), ctx.status(200));
    }

    return res(ctx.text('not found'), ctx.status(404));
  }),
];
