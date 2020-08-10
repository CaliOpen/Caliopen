import React from 'react';
import { shallow } from 'enzyme';
import Link from '.';

jest.mock('react-router-dom', () => {
  const BaseLink = ({ children, ...props }) => (
    <a href="" {...props}>
      {children}
    </a>
  );

  return {
    Link: BaseLink,
  };
});

describe('component Link', () => {
  it('render', () => {
    const context = {
      router: {
        history: {
          push: () => {
            // noop
          },
          replace: () => {
            // noop
          },
        },
      },
    };
    const comp = shallow(<Link to="/foo">Foo</Link>, { context });

    expect(comp.dive().text()).toEqual('Foo');
  });
});
