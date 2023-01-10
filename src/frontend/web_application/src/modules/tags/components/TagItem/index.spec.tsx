import * as React from 'react';
import { render } from '@testing-library/react';
import { AllProviders } from 'test/providers';
import TagItem from '.';
import { TagPayload } from '../../types';

describe('component TagItem', () => {
  it('render', () => {
    const tag: TagPayload = { name: 'foo', label: 'Foo', type: 'user' };
    const onDelete = () => {};

    const { container } = render(<TagItem tag={tag} onDelete={onDelete} />, {
      wrapper: AllProviders,
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
