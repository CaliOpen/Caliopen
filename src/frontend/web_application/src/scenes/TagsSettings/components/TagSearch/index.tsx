import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';
import { useMutation, useQueryClient } from 'react-query';
import { Button, Spinner } from 'src/components';
import TextFieldGroup from 'src/components/TextFieldGroup';
import { createTag, getQueryKeys } from 'src/modules/tags/query';
import { NewTag } from 'src/modules/tags/types';
import './style.scss';

const noop = () => {};

interface Props {
  onCreateSuccess?: () => void;
}
function TagSearch({ onCreateSuccess = noop }: Props) {
  const { i18n } = useLingui();
  const [terms, setTerms] = React.useState('');
  const [tagErrors, setTagErrors] = React.useState<React.ReactNode[]>([]);
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation<unknown, unknown, NewTag>(
    createTag,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getQueryKeys());
      },
    }
  );
  const handleChange = (ev) => {
    setTerms(ev.target.value);
    setTagErrors([]);
  };

  const handleSubmit = async () => {
    if (terms.length === 0) {
      return;
    }

    try {
      await mutateAsync({ label: terms });
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
          isLoading ? (
            <Spinner svgTitleId="add-tag-spinner" isLoading display="inline" />
          ) : (
            'plus'
          )
        }
        disabled={isLoading}
        shape="plain"
        onClick={handleSubmit}
        aria-label={i18n._(/* i18n */ 'tags.action.add', undefined, {
          message: 'Add',
        })}
      />
    </div>
  );
}

export default TagSearch;
