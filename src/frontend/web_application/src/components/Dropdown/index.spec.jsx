import React, { createRef } from 'react';
import { shallow, mount } from 'enzyme';
import Dropdown, { withDropdownControl } from '.';
import { Button } from '..';

const DropdownControl = withDropdownControl(Button);

describe('component DropdownControl > id', () => {
  // don't know how to test yet due to forwardRef
  xit('render', () => {
    const controlRef = createRef();
    const comp = shallow(
      <DropdownControl ref={controlRef}>bar</DropdownControl>
    );

    expect(comp.matchesElement(<Button ref={controlRef}>bar</Button>)).toEqual(
      true
    );
  });
});

describe('component Dropdown', () => {
  xit('should be open', () => {
    // when prop 'show' is true, dropdown should be open
    const comp = shallow(<Dropdown show>bar</Dropdown>);

    expect(comp.state().isOpen).toEqual(true);
  });

  xit('should have no offset', () => {
    // when dropdown is open and there's no dropdownControl,
    // offset should always be null
    const comp = shallow(<Dropdown show>bar</Dropdown>);

    const passForwardRef = comp.find('Dropdown').dive().render();

    expect(passForwardRef.state().dropdownStyle.top).toEqual(undefined);
    expect(passForwardRef.state().dropdownStyle.left).toEqual(undefined);
  });
});
