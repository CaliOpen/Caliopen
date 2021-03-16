import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import Moment from 'react-moment';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { key, enums } from 'openpgp'; // XXX: is this included in the main bundle?
import { Button, Spinner, Icon, Link } from 'src/components';
import getPGPManager from 'src/services/openpgp-manager';
import { strToBase64 } from 'src/services/encode-utils';
import { RootState } from 'src/store/reducer';
import './style.scss';

interface KeyDetails {
  fingerprint: string;
  created: Date;
  userId: string;
  expirationTime: string;
  algorithm: string;
  bitSize: number;
  userIds: string[];
  keyStatus: enums.keyStatus;
}
async function getKeyDetails(publicKey: key.Key): Promise<KeyDetails> {
  const {
    user: {
      userId: { userid: userId },
    },
  } = await publicKey.getPrimaryUser();

  const { expirationTime } = await publicKey.getExpirationTime();
  const {
    // @ts-ignore: the given key is deduced from the documentation
    bits: bitSize,
    // @ts-ignore
    algorithm,
  } = await publicKey.primaryKey.getAlgorithmInfo();
  const keyStatus = await publicKey.verifyPrimaryKey();

  return {
    fingerprint: publicKey.getFingerprint(),
    created: publicKey.primaryKey.getCreationTime(),
    userId,
    expirationTime,
    algorithm,
    bitSize,
    userIds: publicKey.getUserIds(),
    keyStatus,
  };
}

interface Props extends withI18nProps {
  className: string;
  publicKeyArmored: string;
  privateKeyArmored: string;
  editMode: boolean;
  onDeleteKey: (fingerprint: string) => void;
}
function OpenPGPKey({
  className,
  publicKeyArmored,
  privateKeyArmored,
  onDeleteKey,
  i18n,
  editMode = false,
}: Props) {
  const [keyDetails, setKeyDetails] = React.useState<KeyDetails>();
  const [loading, setIsLoading] = React.useState<boolean>(false);
  const locale = useSelector<RootState, string>((state) => state.i18n.locale);

  React.useEffect(() => {
    setIsLoading(true);
    getPGPManager().then(async ({ getKeyFromASCII }) => {
      const pubKey = await getKeyFromASCII(publicKeyArmored);

      pubKey && setKeyDetails(await getKeyDetails(pubKey));
      setIsLoading(false);
    });
  }, [publicKeyArmored]);

  const privateKeyDataUrl = `data:application/x-pgp;base64,${strToBase64(
    privateKeyArmored
  )}`;

  const handleDeleteKey = () => {
    if (!keyDetails) {
      return;
    }

    onDeleteKey(keyDetails.fingerprint);
  };

  const openpgpStatuses = {
    invalid: i18n._('openpgp.status.invalid', undefined, {
      defaults: 'Invalid',
    }),
    expired: i18n._('openpgp.status.expired', undefined, {
      defaults: 'Expired',
    }),
    revoked: i18n._('openpgp.status.revoked', undefined, {
      defaults: 'Revoked',
    }),
    valid: i18n._('openpgp.status.valid', undefined, { defaults: 'Valid' }),
    no_self_cert: i18n._('openpgp.status.no_self_cert', undefined, {
      defaults: 'No self cert',
    }),
  };

  return (
    <div className={classnames(['m-openpgp-key', className])}>
      <div className="m-openpgp-key__main">
        <Spinner isLoading={loading} />
        {keyDetails && (
          <>
            <div className="m-openpgp-key__icon">
              {/* @ts-ignore */}
              <Icon type="key" />
            </div>
            <div className="m-openpgp-key__fingerprint">
              {keyDetails.fingerprint.toUpperCase()}
            </div>

            <div className="m-openpgp-key__actions">
              <Link
                button
                plain
                href={privateKeyDataUrl}
                download="private-key.asc"
              >
                <Trans id="openpgp-key.download">
                  Save and keep in a safe place.
                </Trans>
                {' '}
                {/* @ts-ignore */}
                <Icon type="download" />
              </Link>
              {editMode && (
                // @ts-ignore
                <Button color="alert" onClick={handleDeleteKey}>
                  {/* @ts-ignore */}
                  <Icon type="remove" />
                  <span className="show-for-sr">
                    <Trans id="openpgp.action.remove-key">Remove</Trans>
                  </span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {keyDetails && (
        <div className="m-openpgp-key__summary">
          <span>{keyDetails?.userIds.join(', ')}</span>
          {' '}
          {keyDetails?.created && (
            <Moment format="ll" locale={locale}>
              {keyDetails.created}
            </Moment>
          )}
          {' '}
          {keyDetails.expirationTime && keyDetails.expirationTime.length && (
            <span>
              {'/ '}
              <Moment format="LL" locale={locale}>
                {keyDetails.expirationTime}
              </Moment>
            </span>
          )}
          {' '}
          {keyDetails.keyStatus && openpgpStatuses[keyDetails.keyStatus]}
        </div>
      )}
    </div>
  );
}

export default withI18n()(OpenPGPKey);
