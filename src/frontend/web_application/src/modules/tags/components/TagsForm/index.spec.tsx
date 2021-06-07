import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AllProviders } from 'test/providers';
import TagsForm from '.';

describe('component TagsForm', () => {
  it('render', async () => {
    const updateTags = jest.fn();
    const tags = [];
    render(<TagsForm tagCollection={tags} updateTags={updateTags} />, {
      wrapper: AllProviders,
    });
    screen.getByRole('textbox').focus();
    await waitFor(() => screen.getByText('INBOX'));
    expect(screen.getByText('Foobar')).toBeInTheDocument();
  });
});
