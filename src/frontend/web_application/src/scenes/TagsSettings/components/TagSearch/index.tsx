import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Button, Spinner } from 'src/components';
import TextFieldGroup from 'src/components/TextFieldGroup';

import './style.scss';
import { useDispatch } from 'react-redux';
import { createTag } from 'src/modules/tags';

interface Props extends withI18nProps {
  onCreateSuccess: () => void;
}
function TagSearch({ i18n, onCreateSuccess }: Props) {
  const dispatch = useDispatch();
  const [terms, setTerms] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [tagErrors, setTagErrors] = React.useState<React.ReactNode[]>([]);

  const handleChange = (ev) => {
    setTerms(ev.target.value);
    setTagErrors([]);
  };

  const handleSubmit = async () => {
    if (terms.length === 0) {
      return;
    }
    setPending(true);

    try {
      await dispatch(createTag({ label: terms }));
      setTerms('');
      onCreateSuccess();
    } catch (err) {
      setTagErrors([
        <Trans id="settings.tag.form.error.create_fail">
          Unable to create the tag. A tag with the same id may already exist.
        </Trans>,
      ]);
    }
    setPending(false);
  };

  return (
    <div className="m-add-tag">
      <TextFieldGroup
        name="terms"
        value={terms}
        className="m-add-tag__input"
        label={i18n._('tags.form.add.label', undefined, {
          defaults: 'Add a tag',
        })}
        placeholder={i18n._('tags.form.add.placeholder', undefined, {
          defaults: 'New tag ...',
        })}
        onChange={handleChange}
        showLabelforSr
        errors={tagErrors}
      />
      <Button
        className="m-add-tag__button"
        icon={pending ? <Spinner isLoading display="inline" /> : 'plus'}
        disabled={pending}
        shape="plain"
        onClick={handleSubmit}
        aria-label={i18n._('tags.action.add', undefined, { defaults: 'Add' })}
      />
    </div>
  );
}

export default withI18n()(TagSearch);
