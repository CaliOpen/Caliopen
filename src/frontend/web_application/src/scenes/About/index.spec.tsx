import * as React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { AllProviders } from 'test/providers';
import About from './index';

jest.mock('src/modules/user/services/isAuthenticated', () => ({
  isAuthenticated: () => false,
}));

describe('scenes > About', () => {
  it('render', () => {
    render(<About />, { wrapper: AllProviders });

    expect(screen.getByText('Welcome on Caliopen')).toBeVisible();
  });
});
