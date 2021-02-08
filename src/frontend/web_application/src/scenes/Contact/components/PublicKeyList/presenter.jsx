import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { Button, Icon, Link } from '../../../../components';
import PublicKeyForm from '../PublicKeyForm';
import { strToBase64 } from '../../../../services/encode-utils';

import './style.scss';

const KEY_QUALITY_CLASSES = ['weak', 'average', 'good'];
const KEY_QUALITY_ICONS = [
  'exclamation-triangle',
  'expire-soon',
  'info-circle',
];

@withI18n()
class PublicKeyList extends Component {
  static propTypes = {
    contactId: PropTypes.string.isRequired,
    publicKeys: PropTypes.arrayOf(PropTypes.shape({})),
    requestPublicKeys: PropTypes.func.isRequired,
    didInvalidate: PropTypes.bool,
    isFetching: PropTypes.bool.isRequired,
    needsFetching: PropTypes.bool.isRequired,
    i18n: PropTypes.func.isRequired,
  };

  static defaultProps = {
    didInvalidate: false,
    publicKeys: [],
  };

  state = {
    editMode: false,
    editKey: null,
  };

  componentDidMount() {
    const {
      contactId,
      requestPublicKeys,
      isFetching,
      needsFetching,
      didInvalidate,
    } = this.props;

    if (!isFetching && (needsFetching || didInvalidate)) {
      requestPublicKeys({ contactId });
    }
  }

  componentDidUpdate() {
    const {
      contactId,
      requestPublicKeys,
      isFetching,
      needsFetching,
    } = this.props;

    if (!isFetching && (needsFetching || this.props.didInvalidate)) {
      requestPublicKeys({ contactId });
    }
  }

  onSuccess = () => {
    const { contactId } = this.props;

    this.setState({ editMode: false }, () => {
      this.props.requestPublicKeys({ contactId });
    });
  };

  getKeyQuality = (publicKey) => {
    let score = 2;

    score -= Date.parse(publicKey.expire_date) > Date.now() ? 0 : 1;
    // XXX: not sure about this
    // score -= publicKey.size >= 2048 ? 0 : 1;

    return score;
  };

  enterAddMode = () => {
    this.setState({ editMode: true, editKey: null });
  };

  quitEditMode = () => {
    this.setState({ editMode: false });
  };

  getPublicKeyDataUrl = ({ key }) =>
    `data:application/x-pgp;base64,${strToBase64(key)}`;

  handleEdit = (publicKey) => () =>
    this.setState({ editMode: true, editKey: publicKey.key_id });

  renderKeyItem = (publicKey) => {
    const { contactId, i18n } = this.props;

    if (this.state.editMode && this.state.editKey === publicKey.key_id) {
      return (
        <li key={publicKey.key_id}>
          <PublicKeyForm
            key={publicKey.key_id}
            contactId={contactId}
            publicKey={publicKey}
            onSuccess={this.onSuccess}
            onCancel={this.quitEditMode}
          />
        </li>
      );
    }

    return (
      <li key={publicKey.key_id} className="m-public-key-list__key">
        <Icon
          type={KEY_QUALITY_ICONS[this.getKeyQuality(publicKey)]}
          className={`m-public-key-list__quality-icon--${
            KEY_QUALITY_CLASSES[this.getKeyQuality(publicKey)]
          }`}
          rightSpaced
        />
        <strong className="m-public-key-list__key-label">
          {publicKey.label}
        </strong>
        &nbsp;:&nbsp;
        {publicKey.fingerprint}
        <Link
          button
          href={this.getPublicKeyDataUrl(publicKey)}
          download={`${publicKey.label}.pubkey.asc`}
          title={i18n._('contact.public_key_list.download_key', null, {
            defaults: 'Download key',
          })}
        >
          <Icon type="download" />
        </Link>
        <Button
          icon="edit"
          className="m-public-key-list__edit-button"
          onClick={this.handleEdit(publicKey)}
        />
      </li>
    );
  };

  renderAddForm = () => {
    const { contactId } = this.props;

    if (this.state.editMode && !this.state.editKey) {
      return (
        <PublicKeyForm
          contactId={contactId}
          onSuccess={this.onSuccess}
          onCancel={this.quitEditMode}
        />
      );
    }

    return (
      <Button
        onClick={this.enterAddMode}
        icon="key"
        type="button"
        shape="plain"
      >
        <Trans id="contact.public_keys_list.add_key.label">
          Add public key
        </Trans>
      </Button>
    );
  };

  render() {
    const { publicKeys } = this.props;

    return (
      <Fragment>
        <ul>{publicKeys.map((publicKey) => this.renderKeyItem(publicKey))}</ul>
        {this.renderAddForm()}
      </Fragment>
    );
  }
}

export default PublicKeyList;
