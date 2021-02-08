import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button } from '../../../../components';

class ComposeContactButton extends PureComponent {
  static propTypes = {
    notify: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  handleEventAction = () => {
    this.props.notify({
      message: 'Compose to contact is not yet implemented.',
    });
  };

  render() {
    const { className } = this.props;

    return (
      <Button
        shape="plain"
        onClick={this.handleEventAction}
        icon="comment-o"
        className={className}
      >
        <Trans id="call-to-action.action.compose_contact">
          Compose to this contact
        </Trans>
      </Button>
    );
  }
}

export default ComposeContactButton;
