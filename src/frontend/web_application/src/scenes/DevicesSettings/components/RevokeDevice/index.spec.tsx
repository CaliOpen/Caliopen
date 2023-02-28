import * as React from 'react';

import { render, screen } from '@testing-library/react';
import { generateDevice } from 'test/fixtures/device';
import { AllProviders } from 'test/providers';
import RevokeDevice from '.';

describe('scene RevokeDevice', () => {
  it('render', () => {
    const device = generateDevice();
    render(<RevokeDevice device={device} />, { wrapper: AllProviders });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
