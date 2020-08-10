import React from 'react';
import { shallow } from 'enzyme';
import TagSearch from '.';

describe('component TagSearch', () => {
  const props = {
    i18n: { _: (id) => id },
  };

  it('render', () => {
    const noop = (str) => str;
    const comp = shallow(<TagSearch onSubmit={noop} {...props} />);

    expect(() => {
      comp.render();
    }).not.toThrow();
  });
});
