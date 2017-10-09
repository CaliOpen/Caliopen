import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import BlockList from '../../src/components/BlockList';
import Link from '../../src/components/Link';
import { Code, ComponentWrapper } from '../presenters';

class BlockLists extends Component {
  render() {
    return (
      <div>
        <ComponentWrapper size="tall">
          <BlockList style={{ backgroundColor: '#333' }}>
            {[
              <Link noDecoration>A link</Link>,
              <Link noDecoration>An other link</Link>,
              'Foo',
              'Bar',
            ]}
          </BlockList>
        </ComponentWrapper>
        <Code>{`
import BlockList from './src/components/BlockList';

export default () => (
  <BlockList style={{ backgroundColor: '#333' }}>
    {[
      <Link noDecoration>A link</Link>,
      <Link noDecoration>An other link</Link>,
      'Foo',
      'Bar',
    ]}
  </BlockList>
);
          `}</Code>
      </div>
    );
  }
}

export default BlockLists;
