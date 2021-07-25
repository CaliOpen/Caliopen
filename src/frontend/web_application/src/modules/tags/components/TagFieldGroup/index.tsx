import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import classnames from 'classnames';
import { TextFieldGroup, Button, Spinner } from 'src/components';

import './style.scss';

interface TagFieldGroupProps extends withI18nProps {
  terms: string;
  onSubmit: any;
  onChange: any;
  input?: any;
  isFetching?: boolean;
  errors: React.ReactNode[];
}

function TagFieldGroup({
  i18n,
  terms,
  input = {},
  isFetching = false,
  errors = [],
  onSubmit,
  onChange,
}: TagFieldGroupProps) {
  const handleChange = (ev) => {
    const nextTerms = ev.target.value;
    onChange(nextTerms);
  };

  const handleSubmit = () => {
    if (terms.length === 0) {
      return;
    }

    onSubmit();
  };

  const inputProps = {
    ...input,
    className: classnames(input.className, 'm-tags-search__input'),
    label: i18n._('tags.form.search.label', undefined, { defaults: 'Search' }),
    placeholder: i18n._('tags.form.search.placeholder', undefined, {
      defaults: 'Search a tag ...',
    }),
    onChange: handleChange,
    showLabelforSr: true,
    errors,
  };

  return (
    <div className="m-tags-search">
      <TextFieldGroup
        {...inputProps}
        name="terms"
        value={terms}
        autoComplete="off"
      />
      <Button
        className="m-tags-search__button"
        icon={
          isFetching ? (
            <Spinner svgTitleId="tag-add-spinner" isLoading display="inline" />
          ) : (
            'plus'
          )
        }
        disabled={isFetching}
        onClick={handleSubmit}
        aria-label={i18n._('tags.action.add', undefined, { defaults: 'Add' })}
      />
    </div>
  );
}

export default withI18n()(TagFieldGroup);
