import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { useDispatch } from 'react-redux';
import {
  Spinner,
  Button,
  TextFieldGroup,
  FieldErrors,
  InputFileGroup,
} from 'src/components';
import { useUser } from 'src/modules/user';
import { saveUserPublicKeyAction } from 'src/modules/publicKey';
import { saveKey } from 'src/services/openpgp-keychain-repository';
import { readAsText } from 'src/modules/file';
import {
  ERROR_UNABLE_READ_PRIVATE_KEY,
  ERROR_FINGERPRINTS_NOT_MATCH,
} from 'src/services/openpgp-manager';
import {
  ERROR_NEED_PASSPHRASE,
  ERROR_WRONG_PASSPHRASE,
  getPublicKeyFromPrivateKey,
} from 'src/services/encryption';

import './OpenPGPForm.scss';

const ERROR_REQUIRED = 'required';

interface ImportValue {
  passphrase: string;
  privateKeyArmored: string;
}
const initImportValues = {
  passphrase: '',
  privateKeyArmored: '',
};

interface Errors {
  global?: string[];
  privateKeyArmored?: string[];
}

function validate(values: ImportValue): void | Errors {
  if (!values.privateKeyArmored.length) {
    return {
      privateKeyArmored: [ERROR_REQUIRED],
    };
  }

  return undefined;
}

interface Props extends withI18nProps {
  cancel: () => void;
  onSuccess: () => void;
}

function OpenPGPImportForm({ i18n, cancel, onSuccess }: Props) {
  const dispatch = useDispatch();
  const [importValues, setImportValues] = React.useState<ImportValue>(
    initImportValues
  );

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<Errors>({});

  const { user } = useUser();

  const errorsLabels = {
    [ERROR_REQUIRED]: i18n._(
      'openpgp.feedback.private-key-required',
      undefined,
      { defaults: 'A file is required (extension .asc)' }
    ),
    [ERROR_UNABLE_READ_PRIVATE_KEY]: i18n._(
      'openpgp.feedback.unable-read-private-key',
      undefined,
      { defaults: 'Unable to read private key' }
    ),
    [ERROR_FINGERPRINTS_NOT_MATCH]: i18n._(
      'openpgp.feedback.fingerprints-not-match',
      undefined,
      { defaults: 'Fingerprints do not match' }
    ),
    [ERROR_NEED_PASSPHRASE]: i18n._(
      'openpgp.feedback.need-passphrase',
      undefined,
      { defaults: 'Passphrase is needed to retrieve public key' }
    ),
    [ERROR_WRONG_PASSPHRASE]: i18n._(
      'openpgp.feedback.wrong-passphrase',
      undefined,
      { defaults: 'Cannot decrypt with current passphrase' }
    ),
  };

  const clearForm = () => {
    setErrors({});
    setImportValues(initImportValues);
    // XXX: clear file, implement ref on file input. for now, set edit mode false is enough
  };

  const handleFileChanges = async (file) => {
    // XXX: input file should always provide array: on unset or on set
    const privateKeyArmored =
      file.length === undefined ? await readAsText(file) : '';
    setImportValues((prev) => ({
      ...prev,
      privateKeyArmored,
    }));
    setErrors({});
  };

  const handleImportChanges = (event) => {
    const { name, value } = event.target;
    setImportValues((prev) => ({ ...prev, [name]: value }));
    setErrors({});
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();

    const importErrors = validate(importValues);

    if (!user) {
      return;
    }

    if (importErrors) {
      setErrors(importErrors);
      return;
    }

    setIsLoading(true);
    try {
      const publicKeyArmored = await getPublicKeyFromPrivateKey(
        importValues.privateKeyArmored,
        importValues.passphrase
      );
      await saveKey(publicKeyArmored, importValues.privateKeyArmored);

      dispatch(
        saveUserPublicKeyAction(publicKeyArmored, { contact: user.contact })
        // @ts-ignore: does not see the promise
      ).catch((err) => {
        // silent fail. may be notify the user.
      });
    } catch (error) {
      setErrors((prev) => ({ ...prev, global: [error.message] }));
      setIsLoading(false);
      return;
    }

    clearForm();
    onSuccess();
    setIsLoading(false);
  };

  const handleCancelForm = () => {
    cancel();
  };

  return (
    <form onSubmit={handleImportSubmit}>
      {errors.global && (
        <FieldErrors
          className="m-account-openpgp-form__field-group"
          errors={errors.global.map((key) => errorsLabels[key] || key)}
        />
      )}

      <TextFieldGroup
        id="pgp-passphrase"
        label={i18n._('user.openpgp.form.passphrase.label', undefined, {
          defaults: 'Passphrase',
        })}
        inputProps={{
          value: importValues.passphrase,
          onChange: handleImportChanges,
          name: 'passphrase',
          type: 'password',
        }}
      />
      <InputFileGroup
        required
        className="m-account-openpgp-form__field-group"
        descr={i18n._('user.openpgp.form.private-key.label', undefined, {
          defaults: 'Private key',
        })}
        onInputChange={handleFileChanges}
        name="privateKeyArmored"
        accept="application/x-pgp"
        errors={
          errors.privateKeyArmored &&
          errors.privateKeyArmored.map((key) => errorsLabels[key] || key)
        }
      />
      <div className="m-account-openpgp-form__field-group">
        {/* @ts-ignore */}
        <Button
          className="m-account-openpgp-form__field-group"
          type="submit"
          shape="plain"
        >
          <Spinner svgTitleId="add-pgpkey-spinner" isLoading={isLoading} />
          <Trans id="user.openpgp.action.add">Add</Trans>
        </Button>{' '}
        {/* @ts-ignore */}
        <Button onClick={handleCancelForm} shape="hollow">
          <Trans id="general.action.cancel">Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}

export default withI18n()(OpenPGPImportForm);
