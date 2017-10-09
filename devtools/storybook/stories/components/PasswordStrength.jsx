import React from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { number } from '@kadira/storybook-addon-knobs';
import PasswordStrength from '../../src/components/form/PasswordStrength';
import { Code, ComponentWrapper } from '../presenters';

const Presenter = () => {
  const props = {
    strength: number('strength', 4),
  };

  return (
    <div>
      <ComponentWrapper>
        <PasswordStrength {...props} />
      </ComponentWrapper>
      <Code>
        {`
import PasswordStrength from './src/components/PasswordStrength';

// strength is a number between 0 & 4 usually, the score of https://github.com/dropbox/zxcvbn
export default () => (<PasswordStrength strength={ strength } />);
        `}
      </Code>
    </div>
  );
};

export default Presenter;
