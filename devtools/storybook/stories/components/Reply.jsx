import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { object } from '@kadira/storybook-addon-knobs';
import ReplyForm from '../../src/components/ReplyForm';
import { Code, ComponentWrapper } from '../presenters';

class Presenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      props: {
        level: 50,
      },
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { name, value } = event.target;

    this.setState(prevState => ({
      props: {
        ...prevState.props,
        [name]: value,
      },
    }));
  }

  render() {
    const draftMessage = {
      body: 'Fooo',
    };

    return (
      <div>
        <ComponentWrapper>
          <ReplyForm draftMessage={object('draftMessage', draftMessage)} onSave={action('save')} onSend={action('send')} onChange={action('change')} />
        </ComponentWrapper>
        <Code>
          {`
            import ReplyForm from './src/components/ReplyForm';

            export default () => {
              const handleSave = () => { };
              const handleSend = () => { };
              const handleChange = () => { };
              const draftMessage = {
                body: 'Fooo',
              };

              return (
                <ReplyForm draftMessage={draftMessage} onSave={handleSave} onSend={handleSend} onChange={handleChange} />
              );
            }
          `}
        </Code>
      </div>
    );
  }
}

export default Presenter;
