import React from 'react';
import { shallow } from 'enzyme';
import TagItem from '.';

describe('component TagItem', () => {
  const connectedProps = {
    i18n: { _: (id) => id },
  };

  it('render', () => {
    const props = {
      tag: { name: 'foo', label: 'Foo', type: 'user' },
      onDelete: (whatever) => whatever,
    };

    const comp = shallow(<TagItem {...props} {...connectedProps} />).dive();

    expect(comp.find('Badge').length).toEqual(1);
  });
});
