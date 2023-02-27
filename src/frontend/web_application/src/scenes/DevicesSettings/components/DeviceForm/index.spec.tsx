import * as React from 'react';
import { screen, render } from '@testing-library/react';
import { AllProviders } from 'test/providers';
import { generateDevice } from 'test/fixtures/device';
import DeviceForm from '.';

describe('component Device DeviceForm', () => {
  it('render', () => {
    const device = generateDevice();

    render(<DeviceForm device={device} />, { wrapper: AllProviders });

    expect(screen.getByRole('textbox', { name: 'Name:' }));
    expect(screen.getByRole('combobox', { name: 'Type:' }));
  });

  // input has been disabled
  xdescribe('validates ip', () => {
    it('is valid with simple ip', () => {
      const device = generateDevice();

      render(<DeviceForm device={device} />);

      // expect(inst.validateIP('192.168.1.1')).toEqual({ isValid: true });
    });

    it('is not valid', () => {
      const device = generateDevice();

      render(<DeviceForm device={device} />);

      // expect(inst.validateIP('foo')).toEqual({
      //   isValid: false,
      //   errors: ['device.feedback.invalid_ip'],
      // });
    });
  });
});
