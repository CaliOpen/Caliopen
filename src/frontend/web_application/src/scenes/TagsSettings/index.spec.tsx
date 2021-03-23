import * as React from 'react';
import {
  cleanup,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { rest } from 'msw';
import { server } from 'test/server';
import { AllProviders } from 'test/providers';
import { generateContact } from 'test/fixtures/contacts';
import TagsSettings from '.';
import { Spinner } from 'src/components';
import userEvent from '@testing-library/user-event';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => true,
}));

describe('TagsSettings', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('render', async () => {
    render(<TagsSettings />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));
    expect(screen.getByText('Create new tag')).toBeVisible();
  });

  it('creates a tag', async () => {
    const tags = [
      {
        name: 'INBOX',
        type: 'system',
      },
      {
        name: 'IMPORTANT',
        type: 'system',
      },
      {
        name: 'SPAM',
        type: 'system',
      },
      {
        name: 'foobar',
        label: 'Foobar',
        type: 'user',
      },
    ];

    server.use(
      rest.get('/api/v2/tags', (req, res, ctx) => {
        return res(ctx.json({ tags, total: tags.length }), ctx.status(200));
      }),
      rest.post('/api/v2/tags', (req, res, ctx) => {
        // @ts-ignore
        const { label } = req.body;
        tags.push({ name: label, label, type: 'user' });

        return res(ctx.text('OK'));
      })
    );
    render(<TagsSettings />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));

    userEvent.type(screen.getByLabelText('Add a tag'), 'my tag');
    userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));

    expect(await screen.findByText('my tag')).toBeVisible();
  });
  it('edits a tag', async () => {
    const tags = [
      {
        name: 'INBOX',
        type: 'system',
      },
      {
        name: 'IMPORTANT',
        type: 'system',
      },
      {
        name: 'SPAM',
        type: 'system',
      },
      {
        name: 'foobar',
        label: 'Foobar',
        type: 'user',
      },
    ];

    server.use(
      rest.get('/api/v2/tags', (req, res, ctx) => {
        return res(ctx.json({ tags, total: tags.length }), ctx.status(200));
      }),
      rest.patch('/api/v2/tags/:name', (req, res, ctx) => {
        // @ts-ignore
        const { label } = req.body;

        const idx = tags.findIndex((tag) => tag.name === req.params.name);

        if (idx === -1) {
          return res(ctx.text('not found'), ctx.status(404));
        }
        tags[idx] = {
          ...tags[idx],
          label,
        };

        return res(ctx.text('OK'));
      })
    );
    render(<TagsSettings />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));

    userEvent.click(screen.getByText('Foobar'));

    userEvent.type(screen.getByLabelText('foobar'), ' - Edited');
    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));

    expect(screen.queryByLabelText('foobar')).not.toBeInTheDocument();

    expect(await screen.findByText('Foobar - Edited')).toBeVisible();
  });
});
