import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import classnames from 'classnames';
import { TextFieldGroup, Button, Spinner } from 'src/components';

import './style.scss';

interface TagFieldGroupProps extends withI18nProps {
  terms: string;
  onSubmit: any;
  onChange: any;
  input?: React.ComponentProps<typeof TextFieldGroup>['inputProps'];
  innerRef?: React.ComponentProps<typeof TextFieldGroup>['ref'];
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
  innerRef,
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
    placeholder: i18n._('tags.form.search.placeholder', undefined, {
      defaults: 'Search a tag ...',
    }),
    onChange: handleChange,
    showLabelforSr: true,
    name: 'terms',
    value: terms,
    autoComplete: 'off',
  };

  return (
    <div className="m-tags-search">
      <TextFieldGroup
        id="search_tags"
        label={i18n._('tags.form.search.label', undefined, {
          defaults: 'Search',
        })}
        inputProps={inputProps}
        errors={errors}
        ref={innerRef}
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
