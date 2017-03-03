import React from 'react';
import { shallow } from 'enzyme';
import TagItem from './';

describe('component TagItem', () => {
  it('render', () => {
    const noop = () => {};
    const comp = shallow(
      <TagItem tag={{ name: 'foo', tag_id: 'bar', type: 'user' }} onUpdate={noop} />
    );

    expect(comp.render().find('Button').text()).toEqual('foo');
  });
});
