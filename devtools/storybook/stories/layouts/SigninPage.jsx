import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import SigninForm from '../../src/components/SigninForm';
import AuthPage from '../../src/layouts/AuthPage';
import { Code, ComponentWrapper } from '../presenters';

class Presenter extends Component {
  render() {
    const noop = str =>str;

    return (
      <div>
        <ComponentWrapper>
          <AuthPage version="0.1" login="foo" password="bar">
            <SigninForm __={noop} onSubmit={action('submited')} />
          </AuthPage>
        </ComponentWrapper>
        <Code>
          {`
import SigninForm from './src/components/SigninForm';
export default () => (
  <AuthPage version="0.1" login="foo" password="bar">
    <SigninForm />
  </AuthPage>
);
          `}
        </Code>
      </div>
    );
  }
}

export default Presenter;
