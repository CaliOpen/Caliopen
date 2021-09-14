import * as React from 'react';
import classnames from 'classnames';
import InputText from '../InputText';
import Label from '../Label';
import FieldGroup from '../FieldGroup';

import './style.scss';

interface Props
  extends Omit<React.ComponentProps<typeof InputText>, 'innerRef'> {
  id: string;
  label: React.ReactNode;
  showLabelforSr?: boolean;
  errors?: React.ReactNode[];
  className?: string;
  display?: 'inline' | 'block';
  innerRef: React.ForwardedRef<HTMLInputElement>;
}
function TextFieldGroup({
  id,
  label,
  showLabelforSr = false,
  errors = [],
  className,
  display = 'block',
  innerRef,
  inputProps: { onBlur, ...restInputProps } = {},
  ...restProps
}: Props) {
  const [isPristine, setIsPristine] = React.useState(true);

  const handleBlur = (ev: any) => {
    setIsPristine(false);

    return onBlur && onBlur(ev);
  };

  const hasError = errors.length > 0 && !isPristine;

  const groupClassName = classnames(className, 'm-text-field-group', {
    'm-text-field-group--inline': display === 'inline',
  });

  const labelClassName = classnames('m-text-field-group__label', {
    'show-for-sr': showLabelforSr,
    'm-text-field-group--inline__label': display === 'inline',
  });

  const inputClassName = classnames('m-text-field-group__input', {
    'm-text-field-group--inline__input': display === 'inline',
  });

  const errorsClassName = classnames('m-text-field-group__errors', {
    'm-text-field-group--inline__errors': display === 'inline',
  });

  return (
    <FieldGroup
      className={groupClassName}
      errors={errors}
      errorsClassname={errorsClassName}
    >
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <InputText
        className={inputClassName}
        inputProps={{
          ...restInputProps,
          id,
          onBlur: handleBlur,
        }}
        {...restProps}
        hasError={hasError}
        ref={innerRef}
      />
    </FieldGroup>
  );
}

type TextFieldGroupProps = Omit<Props, 'innerRef'>;

export default React.forwardRef<HTMLInputElement, TextFieldGroupProps>(
  (props, ref) => <TextFieldGroup {...props} innerRef={ref} />
);
