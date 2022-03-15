import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Button, Spinner } from 'src/components';
import TextFieldGroup from 'src/components/TextFieldGroup';

import './style.scss';
import { useDispatch } from 'react-redux';
import { createTag } from 'src/modules/tags';
import { isPending } from '@reduxjs/toolkit';

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
        <Trans
          id="settings.tag.form.error.create_fail"
          message="Unable to create the tag. A tag with the same id may already exist."
        />,
      ]);
    }
    setPending(false);
  };

  return (
    <div className="m-add-tag">
      <TextFieldGroup
        id="tag_settings_add_input"
        className="m-add-tag__input"
        inputProps={{
          name: 'terms',
          value: terms,
          placeholder: i18n._(
            /* i18n */ 'tags.form.add.placeholder',
            undefined,
            {
              message: 'New tag ...',
            }
          ),
          onChange: handleChange,
        }}
        label={i18n._(/* i18n */ 'tags.form.add.label', undefined, {
          message: 'Add a tag',
        })}
        showLabelforSr
        errors={tagErrors}
      />
      <Button
        className="m-add-tag__button"
        icon={
          pending ? (
            <Spinner svgTitleId="add-tag-spinner" isLoading display="inline" />
          ) : (
            'plus'
          )
        }
        disabled={pending}
        shape="plain"
        onClick={handleSubmit}
        aria-label={i18n._(/* i18n */ 'tags.action.add', undefined, {
          message: 'Add',
        })}
      />
    </div>
  );
}

export default withI18n()(TagSearch);
