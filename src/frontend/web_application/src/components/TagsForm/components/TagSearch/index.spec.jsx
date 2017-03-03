import React from 'react';
import { shallow } from 'enzyme';
import TagSearch from './';

describe('component TagSearch', () => {
  it('render', () => {
    const noop = str => str;
    const comp = shallow(
      <TagSearch onSubmit={noop} __={noop} />
    );

    expect(() => {
      comp.render();
    }).not.toThrow();
  });
});
