import React, { Component } from 'react';
import { InstallPromptContext } from '../contexts/InstallPromptContext';

class InstallPromptProvider extends Component {
  state = {
    defferedPrompt: undefined,
  };

  componentDidMount() {
    window.addEventListener('beforeinstallprompt', (ev) => {
      ev.preventDefault();
      this.setState({ defferedPrompt: ev });
    });
  }

  render() {
    return (
      <InstallPromptContext.Provider
        value={this.state.defferedPrompt}
        {...this.props}
      />
    );
  }
}

export default InstallPromptProvider;
