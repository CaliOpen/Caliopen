import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './index';
import Button from '../Button';

describe('component Confirm', () => {
  xit('render', () => {
    const handleConfirm = jest.fn();
    const comp = shallow(
      <Presenter
        onConfirm={handleConfirm}
        render={(confirm) => <Button onClick={confirm}>Delete</Button>}
      />
    );

    expect(comp.text()).toContain('Button');
  });
});
