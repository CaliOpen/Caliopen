import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { withPush } from '../../../routing';
import { Button, Icon } from '../../../../components';

import './style.scss';

@withPush()
class ComposeButton extends PureComponent {
  static propTypes = {
    push: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: undefined,
  };

  handleClick = () => {
    this.props.push('/compose');
  };

  render() {
    const { className } = this.props;

    return (
      <Button
        shape="plain"
        onClick={this.handleClick}
        className={classnames(className, 'm-control-compose-button')}
        icon="pencil"
      >
        <span className="m-control-compose-button__label">
          <Trans id="call-to-action.action.compose">Compose</Trans>
        </span>
        <span className="m-control-compose-button__icon">
          <Icon type="plus" />
        </span>
      </Button>
    );
  }
}

export default ComposeButton;
