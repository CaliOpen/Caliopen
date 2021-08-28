import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import Confirm from './index';
import Button from '../Button';

describe('component Confirm', () => {
  it('render', () => {
    const handleConfirm = jest.fn();
    render(
      <>
        <div id="root" />
        <Confirm
          onConfirm={handleConfirm}
          render={(confirm) => <Button onClick={confirm}>Delete</Button>}
        />
      </>
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
