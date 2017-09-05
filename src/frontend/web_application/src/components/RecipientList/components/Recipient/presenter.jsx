import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Badge from '../../../Badge';
import Button from '../../../Button';
import Icon from '../../../Icon';

const ASSOC_PROTOCOL_ICON = {
  email: 'envelope',
  unknown: 'question-circle',
};

const getIconType = protocol => ASSOC_PROTOCOL_ICON[protocol] || ASSOC_PROTOCOL_ICON.unknown;

class Recipient extends Component {
  static propTypes = {
    participant: PropTypes.shape({}).isRequired,
    onRemove: PropTypes.func,
    __: PropTypes.func.isRequired,
    className: PropTypes.string,
  };
  static defaultProps = {
    onRemove: () => {},
    className: undefined,
  };

  handleClickRemove = () => {
    this.props.onRemove(this.props.participant);
  }

  render() {
    const { participant, className, __ } = this.props;

    return (
      <Badge large className={className}>
        <span>
          <Icon type={getIconType(participant.protocol)} spaced />
          <span>{participant.address}</span>
        </span>
        <Button
          className="m-recipient__col-remove"
          onClick={this.handleClickRemove}
          title={__('messages.compose.action.remove-recipient')}
        >
          <Icon type="remove" spaced />
        </Button>
      </Badge>
    );
  }
}

export default Recipient;
