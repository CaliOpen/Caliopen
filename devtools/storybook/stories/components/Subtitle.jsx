import React from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { text, boolean } from '@kadira/storybook-addon-knobs';
import Subtitle from '../../src/components/Subtitle';
import Button from '../../src/components/Button';
import { Code, ComponentWrapper } from '../presenters';

const Presenter = () => {
  const props = {
    hr: boolean('hr', false),
    actions: (<span className="pull-right">{text('actions', 'Foo')}</span>),
  };

  return (
    <div>
      <ComponentWrapper>
        <Subtitle {...props}>{text('Subtitle children', 'Hello world')}</Subtitle>
      </ComponentWrapper>
      <Code>
        {`
import Subtitle from './src/components/Subtitle';

export default () => (<Subtitle hr actions={(<a href className="pull-right">Foo</a>)}>Hello world</Subtitle>);
        `}
      </Code>
    </div>
  );
};

export default Presenter;
