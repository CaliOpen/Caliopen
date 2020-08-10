import React from 'react';
import { shallow } from 'enzyme';
import TagFieldGroup from '.';

describe('component TagFieldGroup', () => {
  const props = {
    i18n: { _: (id) => id },
  };

  it('render', () => {
    const noop = (str) => str;
    const comp = shallow(<TagFieldGroup onSubmit={noop} {...props} />);

    expect(() => {
      comp.render();
    }).not.toThrow();
  });
});
