import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

describe('component WithTags', () => {
  it('render', async () => {
    const promisedTags = Promise.resolve([
      { label: 'Foo', name: 'foo' },
      { label: 'Bar', name: 'bar' },
      { label: 'FooBar', name: 'foobar' },
    ]);
    const reduxProps = {
      tags: [],
      isFetching: false,
      isInvalidated: false,
      requestTags: jest.fn(async () => {
        reduxProps.tags = await promisedTags;

        return reduxProps.tags;
      }),
    };

    const render = jest.fn();
    const wrapper = shallow(<Presenter render={render} {...reduxProps} />);
    expect(reduxProps.requestTags).toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();

    await promisedTags;
    await wrapper.render();
    expect(render).toHaveBeenCalled();
  });
});
