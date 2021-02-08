import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button } from '../../../../components';
import { withPush } from '../../../routing';

@withPush()
class ComposeContactButton extends PureComponent {
  static propTypes = {
    push: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  handleClick = () => {
    this.props.push('/new-contact');
  };

  render() {
    const { className } = this.props;

    return (
      <Button
        shape="plain"
        onClick={this.handleClick}
        className={className}
        icon="user"
      >
        <Trans id="call-to-action.action.create_contact">
          Create a contact
        </Trans>
      </Button>
    );
  }
}

export default ComposeContactButton;
