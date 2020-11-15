import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Icon } from '../../../../components';
import { getIconType } from '../../../../services/protocols-config';

class Recipient extends Component {
  static propTypes = {
    participant: PropTypes.shape({}).isRequired,
    onRemove: PropTypes.func,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    className: PropTypes.string,
    isValid: PropTypes.bool,
  };

  static defaultProps = {
    onRemove: () => {
      // noop
    },
    className: undefined,
    isValid: true,
  };

  handleClickRemove = () => {
    this.props.onRemove(this.props.participant);
  };

  render() {
    const { participant, className, i18n, isValid } = this.props;

    return (
      <Badge
        large
        className={className}
        onDelete={this.handleClickRemove}
        ariaLabel={i18n._('messages.compose.action.remove-recipient', null, {
          defaults: 'Remove recipient',
        })}
        color={!isValid ? 'alert' : undefined}
      >
        <Icon type={getIconType(participant.protocol)} rightSpaced />
        {participant.address}
      </Badge>
    );
  }
}

export default Recipient;
