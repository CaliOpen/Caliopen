import * as React from 'react';
import { InstallPromptContext } from '../contexts/InstallPromptContext';

function InstallPromptProvider(props: { children: React.ReactNode }) {
  const [value, setValue] = React.useState<{
    defferedPrompt: undefined | Event;
  }>({ defferedPrompt: undefined });

  React.useEffect(() => {
    window.addEventListener('beforeinstallprompt', (ev) => {
      ev.preventDefault();
      setValue({ defferedPrompt: ev });
    });
  }, []);

  return <InstallPromptContext.Provider value={value} {...props} />;
}

export default InstallPromptProvider;
