import React from 'react';
import { mount } from 'enzyme';
import FileSize from '.';

describe.skip('component FileSize', () => {
  it('render mb', () => {
    const comp = mount(<FileSize size={10000000} />);

    expect(comp.text()).toEqual('file.size.mB');
  });

  it('render kb', () => {
    const comp = mount(<FileSize size={10500} />);

    expect(comp.text()).toEqual('file.size.kB');
  });
});
