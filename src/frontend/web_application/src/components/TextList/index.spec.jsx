import React from 'react';
import { shallow } from 'enzyme';
import TextList, { TextItem } from '.';

describe('component TextList', () => {
  it('render', () => {
    const comp = shallow(
      <TextList>
        {[<TextItem key="0">Foo</TextItem>, <TextItem key="1">Bar</TextItem>]}
      </TextList>
    );

    expect(comp.find('TextItem').length).toEqual(2);
    expect(comp.find('TextItem').first().dive().text()).toEqual('Foo');
  });
});
