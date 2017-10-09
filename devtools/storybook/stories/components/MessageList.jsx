import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import MessageList from '../../src/components/MessageList/presenter';
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
    const noop = str => str;
    const draftMessage = {
      body: 'Fooo',
    };

    const messages = [
      { message_id: '1', date: (new Date()).toJSON(), type: 'email', participants: [{ address: 'bender@caliopen.local', type: 'from' }, { address: 'zoidberg@caliopen.local', type: 'cc' }, { address: 'me@caliopen.local', type: 'to' }], body: '<p>It\'s okay, Bender. I like cooking too. You, minion. Lift my arm. AFTER H=\r\nIM! I don\'t know what you did, Fry, but once again, you screwed up! Now all\r\nthe planets are gonna start cracking wise.</p>', subject: '' },
      { message_id: '2', date: (new Date()).toJSON(), type: 'email', participants: [{ address: 'bender@caliopen.local', type: 'to' }, { address: 'zoidberg@caliopen.local', type: 'from' }, { address: 'me@caliopen.local', type: 'to' }], body: '<p>Shut up and take my money! Leela, are you alright?</p>', subject: "Re: Dr. Zoidberg, that doesn't make sense. But, okay!" },
      { message_id: '3', date: (new Date('2017-01-03')).toJSON(), type: 'email', participants: [{ address: 'bender@caliopen.local', type: 'to' }, { address: 'zoidberg@caliopen.local', type: 'to' }, { address: 'me@caliopen.local', type: 'from' }], body: "<p>It's okay, Bender. I like cooking too. You, minion. Lift my arm. AFTER H=\r\nIM! I don't know what you did, Fry, but once again, you screwed up! Now all\r\nthe planets are gonna start cracking wise about our mamas.</p>\r\n<p>You don't know how to do any of those. Leela, Bender, we're going grave\r\nrobbing. And yet you haven't said what I told you to say! How can any of us\r\ntrust you? Leela's gonna kill me. File not found.</p>\r\n<h2>Fry! Quit doing the right thing, you jerk!</h2>\r\n<p>Daddy Bender, we're hungry. Goodbye, cruel world. Goodbye, cruel lamp. G=\r\noodbye, cruel velvet drapes, lined with what would appear to be some sort of\r\n cruel muslin and the cute little pom-pom curtain pull cords. Cruel though\r\n they may be\u2026</p>\r\n<ol>\r\n\r\n    <li>Switzerland is small and neutral! We are more like Germany, ambitio=\r\n\t\tus and misunderstood!</li><li>For the last time, I don't like lilacs! Y=\r\n\t\tour 'first' wife was the one who liked lilacs!</li><li>Isn't it true th=\r\n\t\tat you have been paid for your testimony?</li>\r\n\r\n</ol>\r\n\r\n<h3>I'm sorry, guys. I never meant to hurt you. Just to destroy everything\r\nyou ever believed in.</h3>\r\n<p>Of all the friends I've had\u2026 you're the first. I'm a thing. I was all of\r\nhistory's great robot actors - Acting Unit 0.8; Thespomat; David Duchovny!\r\nGoodbye, friends. I never thought I'd die like this. But I always really ho=\r\nped.</p>\r\n<ul>\r\n\r\n    <li>Is the Space Pope reptilian!?</li><li>Five hours? Aw, man! Couldn't\r\n\t\tyou just get me the death penalty?</li><li>My fellow Earthicans, as I hav=\r\n\t\te explained in my book 'Earth in the Balance'', and the much more popular\r\n\t\t''Harry Potter and the Balance of Earth', we need to defend our planet ag=\r\n\t\tainst pollution.</p>", subject: "Re: Dr. Zoidberg, that doesn't make sense. But, oka" },
    ];

    const props = {
      onReply: action('onReply'),
      onForward: action('onForward'),
      onDelete: action('onDelete'),
      __: noop,
    };

    return (
      <div>
        <ComponentWrapper>
          <MessageList messages={messages} {...props} />
        </ComponentWrapper>
        <Code>
          {`
            import MessageList from './src/components/MessageList';

            export default ({ messages = [] }) => {
              return (
                <MessageList messages={messages}  />
              );
            }
          `}
        </Code>
      </div>
    );
  }
}

export default Presenter;
