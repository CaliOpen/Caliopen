import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button, VerticalMenuItem } from '../../../../components';
import { withNotification } from '../../../../modules/userNotify';
import { InstallPromptConsumer } from '../../../../modules/pwa';

@withNotification()
class InstallButton extends Component {
  static propTypes = {
    notifySuccess: PropTypes.func.isRequired,
  };

  static defaultProps = {};

  state = {
    isInstalled: false,
  };

  handleInstallFactory =
    ({ defferedPrompt }) =>
    async () => {
      const { notifySuccess } = this.props;

      defferedPrompt.prompt();
      const { outcome } = await defferedPrompt.userChoice;

      if (outcome === 'accepted') {
        notifySuccess({
          message: (
            <Trans
              id="pwa.feedback.install-success"
              message="Caliopen has been installed on your device."
            />
          ),
        });
        this.setState({ isInstalled: true });
      }
    };

  render() {
    return (
      <InstallPromptConsumer
        render={(defferedPrompt) => {
          if (!defferedPrompt) {
            // the app is not installable or already installed
            return null;
          }

          if (this.state.isInstalled) {
            return null;
          }

          return (
            <VerticalMenuItem>
              <Button
                display="expanded"
                icon="download"
                center={false}
                onClick={this.handleInstallFactory({ defferedPrompt })}
              >
                <Trans id="pwa.action.install" message="Install" />
              </Button>
            </VerticalMenuItem>
          );
        }}
      />
    );
  }
}

export default InstallButton;
