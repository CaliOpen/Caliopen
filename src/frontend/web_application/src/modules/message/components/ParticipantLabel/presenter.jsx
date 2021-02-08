import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Layout = ({ className, ...props }) => (
  <span className={classnames(className)} {...props} />
);
Layout.propTypes = {
  className: PropTypes.string,
};
Layout.defaultProps = {
  className: undefined,
};

class ParticipantLabel extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    participant: PropTypes.shape({}).isRequired,
    contact: PropTypes.shape({}),
  };

  static defaultProps = {
    className: undefined,
    contact: undefined,
  };

  renderParticipantLabel() {
    const { participant } = this.props;

    if (participant.label !== participant.address) {
      return `${participant.label} (${participant.address})`;
    }

    return participant.label;
  }

  render() {
    const { className, contact } = this.props;

    if (contact && contact.given_name) {
      return (
        <Layout className={className} title={this.renderParticipantLabel()}>
          {contact.given_name}
        </Layout>
      );
    }

    return (
      <Layout className={className}>{this.renderParticipantLabel()}</Layout>
    );
  }
}

export default ParticipantLabel;
