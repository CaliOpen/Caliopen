import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllProviders } from 'test/providers';
import TagsForm from '.';
import { TagPayload } from '../../types';

describe('component TagsForm', () => {
  it('render', async () => {
    const updateTags = jest.fn();
    const tags: TagPayload[] = [
      { name: 'INBOX', type: 'system', label: '' },
      { name: 'foobar', type: 'user', label: 'Foobar' },
    ];
    render(<TagsForm initialTags={tags} onSubmit={updateTags} />, {
      wrapper: AllProviders,
    });
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('add tag', async () => {
    const updateTags = jest.fn();
    const tags: TagPayload[] = [
      { name: 'INBOX', type: 'system', label: '' },
      { name: 'foobar', type: 'user', label: 'Foobar' },
    ];
    render(<TagsForm initialTags={tags} onSubmit={updateTags} />, {
      wrapper: AllProviders,
    });
    expect(await screen.findByText('Foobar')).toBeInTheDocument();
    screen.getByRole('textbox').focus();

    userEvent.type(screen.getByLabelText('Search'), 'I am test');
    userEvent.click(screen.getByRole('button', { name: 'Add' }));
    userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    await waitForElementToBeRemoved(screen.queryByText('Loading …'));

    expect(updateTags).toHaveBeenCalledWith([
      { name: 'INBOX', type: 'system', label: '' },
      { name: 'foobar', type: 'user', label: 'Foobar' },
      { label: 'I am test' },
    ]);
  });

  it('remove tag', async () => {
    const updateTags = jest.fn();
    const tags: TagPayload[] = [
      { name: 'INBOX', type: 'system', label: '' },
      { name: 'foobar', type: 'user', label: 'Foobar' },
    ];
    render(<TagsForm initialTags={tags} onSubmit={updateTags} />, {
      wrapper: AllProviders,
    });
    expect(screen.getByText('Inbox')).toBeInTheDocument();

    const tag = screen.getByText('Foobar');

    if (!tag.parentElement) {
      throw new Error('missing parent');
    }

    userEvent.click(
      within(tag.parentElement).getByRole('button', { name: 'Remove' })
    );

    userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    await waitForElementToBeRemoved(screen.queryByText('Loading …'));

    expect(updateTags).toHaveBeenCalledWith([
      { name: 'INBOX', type: 'system', label: '' },
    ]);
  });

  it('add & remove tag', async () => {
    const updateTags = jest.fn();
    const tags: TagPayload[] = [
      { name: 'INBOX', type: 'system', label: '' },
      { name: 'foobar', type: 'user', label: 'Foobar' },
    ];
    render(<TagsForm initialTags={tags} onSubmit={updateTags} />, {
      wrapper: AllProviders,
    });
    expect(screen.getByText('Inbox')).toBeInTheDocument();

    const tag = screen.getByText('Foobar');

    if (!tag.parentElement) {
      throw new Error('missing parent');
    }

    userEvent.click(
      within(tag.parentElement).getByRole('button', { name: 'Remove' })
    );

    screen.getByRole('textbox').focus();

    userEvent.type(screen.getByLabelText('Search'), 'I am test');
    userEvent.click(screen.getByRole('button', { name: 'Add' }));

    userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    await waitForElementToBeRemoved(screen.queryByText('Loading …'));

    await expect(updateTags).toHaveBeenCalledWith([
      { name: 'INBOX', type: 'system', label: '' },
      { label: 'I am test' },
    ]);
  });
});
