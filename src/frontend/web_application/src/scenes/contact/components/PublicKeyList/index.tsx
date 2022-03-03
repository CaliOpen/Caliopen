import { Trans, withI18n, withI18nProps } from '@lingui/react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPublicKeys } from 'src/store/modules/public-key';
import { RootState } from 'src/store/reducer';
import { Button, Icon, Link } from 'src/components';
import { strToBase64 } from 'src/services/encode-utils';
import PublicKeyForm from '../PublicKeyForm';
import './style.scss';

const KEY_QUALITY_CLASSES = ['weak', 'average', 'good'];
const KEY_QUALITY_ICONS = [
  'exclamation-triangle',
  'expire-soon',
  'info-circle',
];

// FIXME: migrate keyState reducer
type KeyState = any;
interface Props extends withI18nProps {
  contactId: string;
}
function PublicKeyList({ contactId, i18n }: Props) {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = React.useState(false);
  const [editingKey, setEditingKey] = React.useState(undefined);
  const keyState: KeyState | undefined = useSelector<RootState>(
    (state) => state.publicKey[contactId]
  );
  const needsFetching = !keyState;

  React.useEffect(() => {
    if (!keyState?.isFetching && (needsFetching || keyState?.didInvalidate)) {
      dispatch(requestPublicKeys({ contactId }));
    }
  }, [keyState]);

  const onSuccess = () => {
    dispatch(requestPublicKeys({ contactId }));
    setEditMode(false);
  };

  const getKeyQuality = (publicKey) => {
    let score = 2;

    score -= Date.parse(publicKey.expire_date) > Date.now() ? 0 : 1;
    // XXX: not sure about this
    // score -= publicKey.size >= 2048 ? 0 : 1;

    return score;
  };

  const enterAddMode = () => {
    setEditMode(true);
    setEditingKey(undefined);
  };

  const quitEditMode = () => {
    setEditMode(false);
  };

  const getPublicKeyDataUrl = ({ key }) =>
    `data:application/x-pgp;base64,${strToBase64(key)}`;

  const handleEdit = (publicKey) => () => {
    setEditMode(true);
    setEditingKey(publicKey.key_id);
  };

  return (
    <>
      {keyState?.publicKeys && (
        <ul>
          {keyState.publicKeys.map((publicKey) => {
            if (editMode && editingKey === publicKey.key_id) {
              return (
                <li key={publicKey.key_id}>
                  {/* @ts-ignore */}
                  <PublicKeyForm
                    key={publicKey.key_id}
                    contactId={contactId}
                    publicKey={publicKey}
                    onSuccess={onSuccess}
                    onCancel={quitEditMode}
                  />
                </li>
              );
            }

            return (
              <li key={publicKey.key_id} className="m-public-key-list__key">
                <Icon
                  type={KEY_QUALITY_ICONS[getKeyQuality(publicKey)]}
                  className={`m-public-key-list__quality-icon--${
                    KEY_QUALITY_CLASSES[getKeyQuality(publicKey)]
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
                  href={getPublicKeyDataUrl(publicKey)}
                  download={`${publicKey.label}.pubkey.asc`}
                  title={i18n._(
                    'contact.public_key_list.download_key',
                    undefined,
                    {
                      defaults: 'Download key',
                    }
                  )}
                >
                  <Icon type="download" />
                </Link>
                <Button
                  icon="edit"
                  className="m-public-key-list__edit-button"
                  onClick={handleEdit(publicKey)}
                />
              </li>
            );
          })}
        </ul>
      )}
      {editMode && !editingKey ? (
        // @ts-ignore
        <PublicKeyForm
          contactId={contactId}
          onSuccess={onSuccess}
          onCancel={quitEditMode}
        />
      ) : (
        <Button onClick={enterAddMode} icon="key" type="button" shape="plain">
          <Trans id="contact.public_keys_list.add_key.label">
            Add public key
          </Trans>
        </Button>
      )}
    </>
  );
}

export default withI18n()(PublicKeyList);
