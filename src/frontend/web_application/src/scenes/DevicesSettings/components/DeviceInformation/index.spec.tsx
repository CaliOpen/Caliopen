import React from 'react';
import { render, screen } from '@testing-library/react';
import { generateDevice } from 'test/fixtures/device';
import { AllProviders } from 'test/providers';
import DeviceInformation from '.';

describe('scene DeviceInformation', () => {
  it('render current device', () => {
    const device = generateDevice();
    render(<DeviceInformation device={device} isCurrentDevice />, {
      wrapper: AllProviders,
    });
    expect(screen.getByText('Current device')).toBeInTheDocument();
  });
});
