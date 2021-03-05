import * as React from 'react';
import { InstallPromptContext } from '../contexts/InstallPromptContext';

interface Props {
  render: (value) => React.ReactNode;
}
function InstallPromptConsumer({ render }: Props) {
  return (
    <InstallPromptContext.Consumer>
      {(value) => render(value)}
    </InstallPromptContext.Consumer>
  );
}

export default InstallPromptConsumer;
