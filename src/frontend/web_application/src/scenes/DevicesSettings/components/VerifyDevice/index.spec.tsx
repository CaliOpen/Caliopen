import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { generateDevice } from 'test/fixtures/device';
import { AllProviders } from 'test/providers';

import VerifyDevice from '.';

jest.mock('../../../../modules/userNotify', () => ({
  withNotification: () => (noop) => noop,
}));

describe('scene VerifyDevice', () => {
  it('render', () => {
    const device = generateDevice();
    render(<VerifyDevice device={device} />, { wrapper: AllProviders });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
