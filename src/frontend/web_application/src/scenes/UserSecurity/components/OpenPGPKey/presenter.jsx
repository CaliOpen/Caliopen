import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import Moment from 'react-moment';
import { Button, Spinner, Icon, Link } from '../../../../components';
import getPGPManager from '../../../../services/openpgp-manager';
import { strToBase64 } from '../../../../services/encode-utils';

import './style.scss';

async function generateStateFromProps({ props, getKeyFromASCII, keyStatuses }) {
  const publicKey = await getKeyFromASCII(props.publicKeyArmored);
  const {
    primaryKey: { created, algorithm },
  } = publicKey;
  const {
    user: {
      userId: { userid: userId },
    },
  } = await publicKey.getPrimaryUser();
  const { expirationTime } = await publicKey.getExpirationTime();
  const { bits: bitSize } = await publicKey.primaryKey.getAlgorithmInfo();

  return {
    isLoading: false,
    openpgpKey: {
      fingerprint: publicKey.getFingerprint(),
      created,
      algorithm,
      userId,
      expirationTime,
      bitSize,
      userIds: publicKey.users.map((user) => user.userId.userid),
      keyStatus: Object.keys(keyStatuses).find(
        (statusLiteral) =>
          keyStatuses[statusLiteral] === publicKey.verifyPrimaryKey()
      ),
    },
  };
}

@withI18n()
class OpenPGPKey extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    locale: PropTypes.string,
    children: PropTypes.node,
    privateKeyArmored: PropTypes.string,
    editMode: PropTypes.bool,
    onDeleteKey: PropTypes.func,
  };

  static defaultProps = {
    locale: undefined,
    children: undefined,
    privateKeyArmored: undefined,
    editMode: false,
    onDeleteKey: () => {
      // noop
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      isLoading: true,
      openpgpKey: {},
    };

    this.toggleDetails = this.toggleDetails.bind(this);
    this.handleDeleteKey = this.handleDeleteKey.bind(this);
  }

  componentDidMount() {
    getPGPManager().then(
      async ({
        getKeyFromASCII,
        module: {
          enums: { keyStatus: keyStatuses },
        },
      }) =>
        this.setState(
          await generateStateFromProps({
            props: this.props,
            getKeyFromASCII,
            keyStatuses,
          })
        )
    );
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    getPGPManager().then(
      async ({
        getKeyFromASCII,
        module: {
          enums: { keyStatus: keyStatuses },
        },
      }) =>
        this.setState(
          await generateStateFromProps({
            props: newProps,
            getKeyFromASCII,
            keyStatuses,
          })
        )
    );
  }

  getPrivateKeyDataUrl = () =>
    `data:application/x-pgp;base64,${strToBase64(
      this.props.privateKeyArmored
    )}`;

  handleDeleteKey() {
    this.props.onDeleteKey({ fingerprint: this.state.openpgpKey.fingerprint });
  }

  toggleDetails() {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  }

  render() {
    const { i18n, locale, children, editMode } = this.props;
    const openpgpStatuses = {
      invalid: i18n._('openpgp.status.invalid', null, { defaults: 'Invalid' }),
      expired: i18n._('openpgp.status.expired', null, { defaults: 'Expired' }),
      revoked: i18n._('openpgp.status.revoked', null, { defaults: 'Revoked' }),
      valid: i18n._('openpgp.status.valid', null, { defaults: 'Valid' }),
      no_self_cert: i18n._('openpgp.status.no_self_cert', null, {
        defaults: 'No self cert',
      }),
    };

    return (
      <div className="m-openpgp-key">
        <div className="m-openpgp-key__main">
          <Spinner isLoading={this.state.isLoading} />
          <div className="m-openpgp-key__icon">{children}</div>
          <div className="m-openpgp-key__fingerprint">
            {this.state.openpgpKey.fingerprint &&
              this.state.openpgpKey.fingerprint.toUpperCase()}
          </div>

          <div className="m-openpgp-key__actions">
            <Link
              button
              plain
              href={this.getPrivateKeyDataUrl()}
              download="private-key.asc"
            >
              <Trans id="openpgp-key.download">
                Save and keep in a safe place.
              </Trans>
              {' '}
              <Icon type="download" />
            </Link>
            {editMode && (
              <Button color="alert" onClick={this.handleDeleteKey}>
                <Icon type="remove" />
                <span className="show-for-sr">
                  <Trans id="openpgp.action.remove-key">Remove</Trans>
                </span>
              </Button>
            )}
          </div>
        </div>

        {!this.state.showDetails && (
          <div className="m-openpgp-key__summary">
            <span>{this.state.openpgpKey.userId}</span>
            {' '}
            {this.state.openpgpKey.created && (
              <Moment format="ll" locale={locale}>
                {this.state.openpgpKey.created}
              </Moment>
            )}
            {' '}
            {this.state.openpgpKey.expirationTime &&
              this.state.openpgpKey.expirationTime.length && (
                <span>
                  {'/ '}
                  <Moment format="LL" locale={locale}>
                    {this.state.openpgpKey.expirationTime}
                  </Moment>
                </span>
              )}
            {' '}
            {this.state.openpgpKey.keyStatus &&
              openpgpStatuses[this.state.openpgpKey.keyStatus]}
          </div>
        )}
      </div>
    );
  }
}

export default OpenPGPKey;
