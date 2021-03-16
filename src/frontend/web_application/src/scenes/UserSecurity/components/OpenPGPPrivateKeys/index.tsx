import * as React from 'react';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { useDispatch } from 'react-redux';
import { toPairs } from 'lodash';
import { Button } from 'src/components';
import { useUser } from 'src/modules/user';
import {
  getPrimaryKeysByFingerprint,
  deleteKey,
} from 'src/services/openpgp-keychain-repository';

import OpenPGPKey from '../OpenPGPKey';
import OpenPGPGenerateForm from '../OpenPGPGenerateForm';
import OpenPGPImportForm from '../OpenPGPImportForm';
import './style.scss';

const FORM_TYPE_GENERATE = 'generate';
const FORM_TYPE_IMPORT = 'import';
type FormType = typeof FORM_TYPE_GENERATE | typeof FORM_TYPE_IMPORT;

function OpenPGPPrivateKeys() {
  const [keys, setKeys] = React.useState();
  const [editMode, setEditMode] = React.useState(false);
  const [formType, setFormType] = React.useState<FormType>(FORM_TYPE_GENERATE);

  React.useEffect(() => {
    loadKeys();
  }, []);

  const handleKeyAddedSuccess = () => {
    setEditMode(false);
    loadKeys();
  };

  const loadKeys = () => {
    getPrimaryKeysByFingerprint().then(setKeys);
  };

  const handleClickEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleDeleteKey = async (fingerprint) => {
    await deleteKey(fingerprint);
    loadKeys();
  };

  const handleSwitchFormType = (event) => {
    setFormType(event.target.name);
  };

  const generateHollowProp =
    formType === FORM_TYPE_GENERATE ? { shape: 'hollow' } : {};
  const rawHollowProp =
    formType === FORM_TYPE_IMPORT ? { shape: 'hollow' } : {};

  return (
    <div className="m-account-openpgp">
      {toPairs(keys || []).map(([fingerprint, key]) => (
        <OpenPGPKey
          key={fingerprint}
          className="m-account-openpgp__keys"
          publicKeyArmored={key.publicKeyArmored}
          privateKeyArmored={key.privateKeyArmored}
          editMode={editMode}
          onDeleteKey={handleDeleteKey}
        />
      ))}
      {editMode ? (
        <>
          <div className="m-account-openpgp__switch-mode-btns">
            {/* @ts-ignore */}
            <Button
              onClick={handleSwitchFormType}
              name={FORM_TYPE_GENERATE}
              {...generateHollowProp}
            >
              <Trans id="user.openpgp.action.switch-generate-key">
                Generate key
              </Trans>
            </Button>{' '}
            {/* @ts-ignore */}
            <Button
              onClick={handleSwitchFormType}
              name={FORM_TYPE_IMPORT}
              {...rawHollowProp}
            >
              <Trans id="user.openpgp.action.switch-import-raw-key">
                Import key
              </Trans>
            </Button>
          </div>
          <div className="m-account-openpgp__form">
            {formType === FORM_TYPE_GENERATE && (
              <OpenPGPGenerateForm
                cancel={handleClickEditMode}
                onSuccess={handleKeyAddedSuccess}
              />
            )}
            {formType === FORM_TYPE_IMPORT && (
              <OpenPGPImportForm
                cancel={handleClickEditMode}
                onSuccess={handleKeyAddedSuccess}
              />
            )}
          </div>
        </>
      ) : (
        <div className="m-account-openpgp__toggle-edit">
          {/* @ts-ignore */}
          <Button onClick={handleClickEditMode} shape="plain" icon="plus">
            <Trans id="user.openpgp.action.edit-keys">Edit and add keys</Trans>
          </Button>
        </div>
      )}
    </div>
  );
}

export default OpenPGPPrivateKeys;
