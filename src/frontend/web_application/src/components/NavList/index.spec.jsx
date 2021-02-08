import React from 'react';
import { shallow } from 'enzyme';
import NavList, { NavItem } from '.';

describe('component NavList', () => {
  it('render', () => {
    const comp = shallow(
      <NavList>
        {[<NavItem key="0">Foo</NavItem>, <NavItem key="1">Bar</NavItem>]}
      </NavList>
    );

    expect(comp.find('NavItem').length).toEqual(2);
    expect(comp.find('NavItem').first().dive().text()).toEqual('Foo');
  });
});
