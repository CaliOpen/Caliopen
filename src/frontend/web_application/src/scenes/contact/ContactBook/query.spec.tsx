import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { rest } from 'msw';
import { NewTag } from 'src/modules/tags/types';
import { TagMixed } from 'src/modules/tags/query';
import { AllProviders } from 'test/providers';
import { server } from 'test/server';
import { generateContact } from 'test/fixtures/contacts';
import { useUpdateContactsTags } from './query';

const contactIds = ['1', 'no-changes', '5', 'missing'];
const contacts = [
  generateContact({ contact_id: '1', tags: ['me', 'bar'] }),
  generateContact({
    contact_id: 'no-changes',
    tags: ['important', 'foo', 'bar', 'new', 'new too'], // desync user's tags & contact tags, it should not happen
  }),
  generateContact({ contact_id: '5', tags: [] }),
  generateContact({ contact_id: 'other-1', tags: ['important'] }),
  generateContact({ contact_id: 'other-2', tags: [] }),
];
const tags: TagMixed[] = [
  { label: 'Important', name: 'important', type: 'system' },
  { label: 'foo', name: 'foo', type: 'user' },
  { label: 'bar' },
  { label: 'new' },
  { label: 'new too' },
];

function My() {
  const { mutateAsync, isSuccess, isError } = useUpdateContactsTags();

  React.useEffect(() => {
    const fetcher = async () => {
      try {
        await mutateAsync({ contactIds, tags });
      } catch (err) {
        console.error('----------Mutation Error-------------', err);
      }
    };
    fetcher();
  }, []);

  return (
    <div>
      {isSuccess && 'Done'}
      {isError && 'Failed'}
      {!isError && !isSuccess && 'In progress'}
    </div>
  );
}

describe('scenes > contact > ContactBook > query', () => {
  it('useUpdateContactsTags', async () => {
    const knownTagsAPI = jest.fn();
    const createTagsAPI = jest.fn();
    const contactTagAPI = jest.fn();
    const knownTags = [
      { label: 'Important', name: 'important', type: 'system' },
      { label: 'foo', name: 'foo', type: 'user' },
      { label: 'bar', name: 'bar', type: 'user' },
    ];

    server.use(
      rest.get('/api/v2/tags', (req, res, ctx) => {
        knownTagsAPI();

        return res(
          ctx.json({ tags: knownTags, total: knownTags.length }),
          ctx.status(200)
        );
      }),
      rest.post<NewTag>('/api/v2/tags', (req, res, ctx) => {
        createTagsAPI(req.body);
        const tag = {
          ...req.body,
          name: req.body.label,
          type: 'user',
        };
        knownTags.push(tag);

        return res(ctx.json({ message: 'OK' }), ctx.status(201));
      }),
      rest.patch('/api/v2/contacts/:contactId/tags', (req, res, ctx) => {
        contactTagAPI(req.params.contactId, req.body);

        return res(ctx.status(200), ctx.json({ message: 'OK' }));
      }),
      rest.get('/api/v2/contacts', (req, res, ctx) =>
        res(ctx.json({ contacts, total: contacts.length }), ctx.status(200))
      )
    );

    render(<My />, { wrapper: AllProviders });

    expect(screen.getByText('In progress')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText('In progress'), {
      timeout: 2000, // FIXME: too looong 😱
    });
    expect(screen.getByText('Done')).toBeInTheDocument();

    expect(knownTagsAPI).toHaveBeenCalled();
    expect(createTagsAPI).toHaveBeenCalledTimes(2);
    expect(createTagsAPI).toHaveBeenNthCalledWith(1, { label: 'new' });
    expect(createTagsAPI).toHaveBeenNthCalledWith(2, { label: 'new too' });
    expect(knownTagsAPI).toHaveBeenCalled();

    expect(contactTagAPI).toHaveBeenCalledTimes(2);
    expect(contactTagAPI).toHaveBeenNthCalledWith(1, '1', {
      tags: ['important', 'foo', 'bar', 'new', 'new too'],
      current_state: {
        tags: ['me', 'bar'],
      },
    });
    expect(contactTagAPI).toHaveBeenNthCalledWith(2, '5', {
      tags: ['important', 'foo', 'bar', 'new', 'new too'],
      current_state: {
        tags: [],
      },
    });
  });
});
