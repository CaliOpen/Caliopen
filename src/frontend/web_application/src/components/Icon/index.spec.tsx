import * as React from 'react';
import { render } from '@testing-library/react';
import Icon from '.';

describe('component Icon', () => {
  it('render', () => {
    const { container } = render(<Icon type="edit" />);

    expect(container).toMatchSnapshot();
  });
});
