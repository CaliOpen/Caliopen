import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    render(<TagsForm tagCollection={tags} updateTags={updateTags} />, {
      wrapper: AllProviders,
    });
    screen.getByRole('textbox').focus();

    await waitFor(() => screen.getByText('Inbox'));
    expect(screen.getByText('Foobar')).toBeInTheDocument();
  });
});
