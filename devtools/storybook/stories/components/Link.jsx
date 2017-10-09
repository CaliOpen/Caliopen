import React from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { boolean, text } from '@kadira/storybook-addon-knobs';
import Link from '../../src/components/Link';
import { Code, ComponentWrapper } from '../presenters';

const Links = () => {
  const props = {
    noDecoration: boolean('noDecoration', false),
    button: boolean('button', false),
    expanded: boolean('expanded', false),
    active: boolean('active', false),
  };

  return (
    <div>
      <ComponentWrapper>
        <Link {...props}>{text('Link children', 'Click Me')}</Link>
      </ComponentWrapper>
      <Code>
        {`
import Link from './src/components/Link';
export default () => (<Link noDecoration button expanded active />);
        `}
      </Code>
    </div>
  );
};

export default Links;
