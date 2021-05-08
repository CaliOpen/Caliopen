import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Button, Spinner } from 'src/components';
import TextFieldGroup from 'src/components/TextFieldGroup';

import './style.scss';
import { useCreateTagMutation } from 'src/modules/tags/store';

interface Props extends withI18nProps {}
function TagSearch({ i18n }: Props) {
  const [terms, setTerms] = React.useState('');
  const [tagErrors, setTagErrors] = React.useState<React.ReactNode[]>([]);
  const [createTag, meta] = useCreateTagMutation();
  const { isLoading: pending } = meta;

  const handleChange = (ev) => {
    setTerms(ev.target.value);
    setTagErrors([]);
  };

  const handleSubmit = async () => {
    if (terms.length === 0) {
      return;
    }

    try {
      const res = await createTag({ label: terms }).unwrap();

      setTerms('');
    } catch (err) {
      if (err.data?.errors?.some((item) => item.code === 5)) {
        setTagErrors([
          <Trans id="settings.tag.form.error.create_fail">
            Unable to create the tag. A tag with the same id already exist.
          </Trans>,
        ]);
      } else {
        setTagErrors([
          <Trans id="settings.tag.form.error.create_fail_unexpected">
            Unable to create the tag. An unexpected error occured.
          </Trans>,
        ]);
      }
    }
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
