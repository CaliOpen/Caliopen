import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import {
  Spinner,
  Button,
  CheckboxFieldGroup,
  SelectFieldGroup,
  TextFieldGroup,
  FieldErrors,
} from 'src/components';
import getPGPManager from 'src/services/openpgp-manager';
import { useUser } from 'src/modules/user';
import { saveUserPublicKeyAction } from 'src/modules/publicKey';
import { saveKey } from 'src/services/openpgp-keychain-repository';
import { useDispatch } from 'react-redux';
import './OpenPGPForm.scss';

interface GenerateValue {
  email: string;
  passphrase: string;
}
const initGenerateValues: GenerateValue = {
  email: '',
  passphrase: '',
};

interface Props extends withI18nProps {
  cancel: () => void;
  onSuccess: () => void;
}

function OpenPGPGenerateForm({ i18n, cancel, onSuccess }: Props) {
  const dispatch = useDispatch();
  const [generateValues, setGenerateValues] = React.useState(
    initGenerateValues
  );
  const [hasPassphrase, setHasPassphrase] = React.useState<boolean>(false);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<undefined | string[]>();

  const { user } = useUser();

  const emailOptions =
    user?.contact.emails?.map((email) => ({
      label: email.address,
      value: email.address,
    })) || [];

  const errorsLabels = {};

  const handleToggleHasPassprase = () => {
    setHasPassphrase((prev) => !prev);
  };

  const handleGenerateChanges = (event) => {
    const { name, value } = event.target;
    setGenerateValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors(undefined);
  };

  const handleGenerateSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setIsLoading(true);
    const { passphrase, email } = generateValues;
    const manager = await getPGPManager();

    const { privateKeyArmored, publicKeyArmored } = await manager.generateKey(
      user.contact.given_name,
      email,
      passphrase
    );
    try {
      await saveKey(publicKeyArmored, privateKeyArmored);
      dispatch(saveUserPublicKeyAction(publicKeyArmored, user));
      setGenerateValues(initGenerateValues);
      onSuccess();
    } catch (error) {
      setErrors([error]);
    }

    setIsLoading(false);
  };

  const handleCancelForm = () => {
    cancel();
  };

  return (
    <form onSubmit={handleGenerateSubmit}>
      {errors && (
        <FieldErrors
          className="m-account-openpgp-form__field-group"
          errors={errors.map((key) => errorsLabels[key] || key)}
        />
      )}
      {emailOptions.length > 1 && (
        <SelectFieldGroup
          className="m-account-openpgp-form__field-group"
          label={i18n._('user.openpgp.form.email.label', undefined, {
            defaults: 'Email:',
          })}
          value={generateValues.email}
          onChange={handleGenerateChanges}
          name="email"
          options={emailOptions}
          required
        />
      )}
      {emailOptions.length === 1 && (
        <p className="m-account-openpgp-form__field-group">
          <Trans id="user.openpgp.form.email.label">Email:</Trans>{' '}
          {generateValues.email}
        </p>
      )}
      <div className="m-account-openpgp-form__field-group">
        <Trans id="user.openpgp.has-passphrase">Enable passphrase</Trans>{' '}
        <CheckboxFieldGroup
          displaySwitch
          label={i18n._('user.openpgp.has-passphrase', undefined, {
            defaults: 'Enable passphrase',
          })}
          value={hasPassphrase}
          onChange={handleToggleHasPassprase}
        />
      </div>

      {hasPassphrase && (
        <div className="m-account-openpgp-form__field-group">
          <TextFieldGroup
            label={i18n._('user.openpgp.form.passphrase.label', undefined, {
              defaults: 'Passphrase',
            })}
            type="password"
            value={generateValues.passphrase}
            onChange={handleGenerateChanges}
            name="passphrase"
            autocomplete="new-password"
          />
        </div>
      )}
      <div className="m-account-openpgp-form__field-group">
        {/* @ts-ignore */}
        <Button type="submit" shape="plain">
          <Spinner isLoading={isLoading} />{' '}
          <Trans id="user.openpgp.action.create">Create</Trans>
        </Button>{' '}
        {/* @ts-ignore */}
        <Button onClick={handleCancelForm} shape="hollow">
          <Trans id="general.action.cancel">Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}

export default withI18n()(OpenPGPGenerateForm);
