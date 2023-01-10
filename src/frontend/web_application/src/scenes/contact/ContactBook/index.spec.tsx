import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import * as React from 'react';
import { NewTag } from 'src/modules/tags/types';
import { generateContact } from 'test/fixtures/contacts';
import { AllProviders } from 'test/providers';
import { server } from 'test/server';
import ContactBook from '.';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => true,
}));

const contacts = [
  generateContact({ contact_id: '1', tags: ['me', 'bar'], given_name: 'Me' }),
  generateContact({
    contact_id: 'a',
    tags: ['foo', 'foobar', 'baz'],
    given_name: 'Perso A',
    family_name: '',
  }),
  generateContact({
    contact_id: 'b',
    tags: ['foobar', 'bar', 'baz'],
    given_name: 'Perso B',
    family_name: '',
  }),
];
describe('ContactBook', () => {
  describe('edit tags', () => {
    it('update tags of selected contacts with n tags in common: keep not common, remove one common & add existing one & create new one', async () => {
      const createTagsAPI = jest.fn();
      const contactTagAPI = jest.fn();
      const knownTags = [
        { label: 'Important', name: 'important', type: 'system' },
        { label: 'foo', name: 'foo', type: 'user' },
        { label: 'bar', name: 'bar', type: 'user' },
        { label: 'Foobar', name: 'foobar', type: 'user' },
        { label: 'Baz', name: 'baz', type: 'user' },
      ];

      server.use(
        rest.get('/api/v2/tags', (req, res, ctx) =>
          res(
            ctx.json({ tags: knownTags, total: knownTags.length }),
            ctx.status(200)
          )
        ),
        rest.post<NewTag>('/api/v2/tags', (req, res, ctx) => {
          createTagsAPI(req.body);
          const tag = {
            ...req.body,
            // @ts-ignore :shrug:
            name: req.body.label.replaceAll(' ', '_').toLowerCase(),
            type: 'user',
          };
          knownTags.push(tag);

          return res(ctx.json({ message: 'OK' }), ctx.status(201));
        }),
        rest.patch<{ tags: string[] }>(
          '/api/v2/contacts/:contactId/tags',
          (req, res, ctx) => {
            contactTagAPI(req.params.contactId, req.body);

            const idx = contacts.findIndex(
              (contact) => contact.contact_id === req.params.contactId
            );
            const { tags } = req.body;
            contacts[idx].tags = tags;

            return res(ctx.status(200), ctx.json({ message: 'OK' }));
          }
        ),
        rest.get('/api/v2/contacts', (req, res, ctx) =>
          res(ctx.json({ contacts, total: contacts.length }), ctx.status(200))
        )
      );

      render(<ContactBook />, {
        wrapper: AllProviders,
      });

      await waitForElementToBeRemoved(
        screen.queryByTitle('Contact list is loading.'),
        { timeout: 5000 } // why is this so long?
      );

      const persoA = screen.getByRole('link', { name: /Perso A/ });
      if (!persoA.parentElement) {
        throw Error('perso A parent is missing');
      }
      const persoB = screen.getByRole('link', { name: /Perso B/ });
      if (!persoB.parentElement) {
        throw Error('perso A parent is missing');
      }
      userEvent.click(
        within(persoA.parentElement).getByRole('checkbox', {
          name: 'Select the contact',
        })
      );
      userEvent.click(
        within(persoB.parentElement).getByRole('checkbox', {
          name: 'Select the contact',
        })
      );

      userEvent.click(screen.getByRole('button', { name: 'Manage tags' }));

      const modal = screen.getByRole('dialog', { name: 'Tags' });

      const banner = within(modal).getByRole('banner');
      expect(banner).toHaveTextContent('Tags (Total: 2)');

      // remove one in common
      const tag = within(modal).getByText('Baz').parentElement;
      if (!tag) {
        throw Error('tag element cannot be found');
      }
      userEvent.click(within(tag).getByRole('button', { name: 'Remove' }));

      // create new one
      screen.getByRole('textbox').focus();
      userEvent.type(screen.getByLabelText('Search'), 'I am a new tag');
      userEvent.click(screen.getByRole('button', { name: 'Add' }));

      // add existing one
      userEvent.type(screen.getByLabelText('Search'), 'impo'); // existing tag
      userEvent.click(screen.getByRole('button', { name: 'Add' }));

      userEvent.click(screen.getByRole('button', { name: 'Validate' }));

      await waitForElementToBeRemoved(
        screen.getByRole('button', { name: /Loading …/ })
      );

      expect(createTagsAPI).toHaveBeenCalledWith({ label: 'I am a new tag' });

      expect(contactTagAPI).toHaveBeenCalledTimes(2);
      expect(contactTagAPI).toHaveBeenNthCalledWith(1, 'a', {
        current_state: { tags: ['foo', 'foobar', 'baz'] },
        tags: ['important', 'foobar', 'i_am_a_new_tag'],
      });
      expect(contactTagAPI).toHaveBeenNthCalledWith(2, 'b', {
        current_state: { tags: ['foobar', 'bar', 'baz'] },
        tags: ['important', 'foobar', 'i_am_a_new_tag'],
      });

      expect(await screen.findByText('I am a new tag')).toBeInTheDocument();

      expect(
        screen.getByText('Perso A').parentElement?.parentElement
      ).toHaveTextContent('Perso AImportantFoobarI am a new tag');
      expect(
        screen.getByText('Perso B').parentElement?.parentElement
      ).toHaveTextContent('Perso BImportantFoobarI am a new tag');
    }, 5000);
  });
});
