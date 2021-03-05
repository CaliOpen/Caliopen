import { createContext } from 'react';

export const InstallPromptContext = createContext<{
  defferedPrompt: undefined | Event;
}>({
  defferedPrompt: undefined,
});
