import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from 'test/server';
import { AllProviders } from 'test/providers';
import TagsSettings from '.';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => true,
}));

describe('TagsSettings', () => {
  // afterEach(() => {
  //   jest.clearAllMocks();
  // });
  it('render', async () => {
    // const tags = [
    //   {
    //     name: 'INBOX',
    //     type: 'system',
    //   },
    //   {
    //     name: 'IMPORTANT',
    //     type: 'system',
    //   },
    //   {
    //     name: 'SPAM',
    //     type: 'system',
    //   },
    //   {
    //     name: 'foobar',
    //     label: 'Foobar',
    //     type: 'user',
    //   },
    // ];
    // server.use(
    //   rest.get('/api/v2/tags', (req, res, ctx) => {
    //     const ret = new Promise((resolve) => {
    //       setTimeout(() => {
    //         resolve(
    //           res(ctx.json({ tags, total: tags.length }), ctx.status(200))
    //         );
    //       }, 1000);
    //     });
    //     return ret;
    //   })
    // );

    render(<TagsSettings />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'), {
      timeout: 1000,
    });
    expect(screen.getByText('Create new tag')).toBeVisible();
  });

  it.skip('creates a tag', async () => {
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

    // XXX: ReferenceError failure
    // userEvent.type(screen.getByLabelText('Add a tag'), 'my tag');
    // userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));

    expect(await screen.findByText('my tag')).toBeVisible();
  });
  it.skip('edits a tag', async () => {
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

    // XXX: ReferenceError failure
    // userEvent.click(screen.getByText('Foobar'));

    // userEvent.type(screen.getByLabelText('foobar'), ' - Edited');
    // userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitForElementToBeRemoved(screen.getByLabelText('Loading …'));

    expect(screen.queryByLabelText('foobar')).not.toBeInTheDocument();

    expect(await screen.findByText('Foobar - Edited')).toBeVisible();
  });
});
