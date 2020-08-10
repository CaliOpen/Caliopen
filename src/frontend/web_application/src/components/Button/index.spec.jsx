import React from 'react';
import { mount } from 'enzyme';
import Button from '.';

describe('component Button', () => {
  it('should render', () => {
    const handleClick = jest.fn();

    const comp = mount(<Button onClick={handleClick}>Foo</Button>);

    expect(comp.text()).toEqual('Foo');
    comp.simulate('click');
    expect(handleClick).toHaveBeenCalled();
  });
});
