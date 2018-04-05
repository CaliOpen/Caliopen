import React from 'react';
import { shallow } from 'enzyme';
import BlockList from './';

describe('component BlockList', () => {
  it('render', () => {
    const comp = shallow(<BlockList> {['Foo', 'Bar']} </BlockList>);

    expect(comp.find('li').length).toEqual(2);
    expect(comp.find('li').first().text()).toEqual('Foo');
  });
});
