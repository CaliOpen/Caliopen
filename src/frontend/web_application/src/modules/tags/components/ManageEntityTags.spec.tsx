import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { AllProviders } from 'test/providers';
import ManageEntityTags from './ManageEntityTags';

describe('component ManageEntityTags', () => {
  it('render', async () => {
    const onSuccess = jest.fn();
    const entity = {
      tags: ['INBOX', 'foobar'],
    };

    render(
      <ManageEntityTags
        entity={entity}
        type="contact"
        onSuccessChange={onSuccess}
      />,
      {
        wrapper: AllProviders,
      }
    );
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });
});
