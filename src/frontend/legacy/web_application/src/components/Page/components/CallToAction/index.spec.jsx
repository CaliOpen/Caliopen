import * as selectors from './index';

describe('component CallToAction', () => {
  it('init', () => {
    const state = {
      application: { applicationName: '' },
    };
    const isActive = jest.fn(path => path === '/');
    const props = { router: { isActive } };

    expect(selectors.principalActionSelector(state, props).route).toEqual('/');
    expect(selectors.availableActionsSelector(state, props).length).toEqual(1);
  });
});
