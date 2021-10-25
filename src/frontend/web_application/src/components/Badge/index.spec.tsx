import { render, screen } from '@testing-library/react';
import * as React from 'react';
import Badge from '.';

describe('component Badge', () => {
  it('render', () => {
    render(<Badge>Foo</Badge>);

    expect(screen.getByText('Foo')).toBeInTheDocument();
  });
});
