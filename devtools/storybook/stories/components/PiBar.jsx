import React from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { number } from '@kadira/storybook-addon-knobs';
import PiBar from '../../src/components/PiBar';
import { Code, ComponentWrapper } from '../presenters';

const Presenter = () => {
  const props = {
    level: number('level', 50),
  };

  return (
    <div>
      <ComponentWrapper>
        <PiBar {...props} />
      </ComponentWrapper>
      <Code>
        {`
import PiBar from './src/components/PiBar';

// level: number between 0 and 100
export default () => (<PiBar level={ level } />);
        `}
      </Code>
    </div>
  );
};

export default Presenter;
