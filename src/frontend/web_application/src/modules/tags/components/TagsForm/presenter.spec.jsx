import React from 'react';
import { shallow } from 'enzyme';
import TagsForm from './presenter';

describe('component TagsForm', () => {
  const connectedProps = {
    i18n: { _: (id) => id },
  };

  it('render', () => {
    const noop = (str) => str;
    const comp = shallow(
      <TagsForm search={noop} updateTags={noop} {...connectedProps} />
    );

    expect(comp.find('VerticalMenu').length).toEqual(1);
  });
});
