import React from 'react';
import { shallow } from 'enzyme';
import SwitchWithRoutes from '.';

describe('routing - SwitchWithRoutes', () => {
  const routes = [
    {
      path: '/foo',
      component: ({ children }) => <div>Foo {children}</div>,
      app: 'auth',
      routes: [
        {
          path: '/foo/subfoo1',
          component: () => <div>Sub Foo</div>,
        },
      ],
    },
    {
      path: '/bar',
      app: 'auth',
      routes: [
        {
          path: '/bar/subbar1',
          component: () => <div>Bar 1</div>,
        },
      ],
    },
  ];

  it('render', () => {
    const comp = shallow(<SwitchWithRoutes routes={routes} />);

    expect(comp.find('Route').length).toEqual(2);
  });
});
