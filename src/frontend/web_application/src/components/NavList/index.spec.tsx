import * as React from 'react';
import { render, screen } from '@testing-library/react';
import NavList, { NavItem } from '.';

describe('component NavList', () => {
  it('render', () => {
    render(
      <NavList>
        {[<NavItem key="0">Foo</NavItem>, <NavItem key="1">Bar</NavItem>]}
      </NavList>
    );

    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });
});
