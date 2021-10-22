import classnames from 'classnames';
import type { FieldProps } from 'formik';
import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import FieldGroup from '../FieldGroup';
import InputText from '../InputText';
import Label from '../Label';
import './style.scss';

interface Props {
  id: string;
  label: React.ReactNode;
  showLabelforSr?: boolean;
  errors?: React.ReactNode[];
  className?: string;
  display?: 'inline' | 'block';
  innerRef: React.ForwardedRef<HTMLInputElement>;
  inputProps: Omit<React.ComponentProps<typeof InputText>, 'innerRef'>;
}
function TextFieldGroup({
  id,
  label,
  showLabelforSr = false,
  errors = [],
  className,
  display = 'block',
  innerRef,
  inputProps: { onBlur, className: inputClassName, ...restInputProps } = {},
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

  const inputPropsClassName = classnames(
    'm-text-field-group__input',
    {
      'm-text-field-group--inline__input': display === 'inline',
    },
    inputClassName
  );

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
        id={id}
        className={inputPropsClassName}
        hasError={hasError}
        expanded={display === 'block'}
        {...restInputProps}
        onBlur={handleBlur}
        ref={innerRef}
      />
    </FieldGroup>
  );
}

type TextFieldGroupProps = Omit<Props, 'innerRef'>;

const ForwardedTextFieldGroup = React.forwardRef<
  HTMLInputElement,
  TextFieldGroupProps
>((props, ref) => <TextFieldGroup {...props} innerRef={ref} />);

export default ForwardedTextFieldGroup;

type ReduxTextFieldGroupProps = WrappedFieldProps & Props;

export const ReduxTextFieldGroup = ({
  input,
  meta,
  inputProps: inputPropsBase,
  ...props
}: ReduxTextFieldGroupProps): React.ReactNode => {
  const inputProps = {
    ...inputPropsBase,
    ...input,
  };

  const errors = meta.error ? [meta.error] : undefined;

  return <TextFieldGroup inputProps={inputProps} errors={errors} {...props} />;
};

type FormikTextFieldGroupProps = FieldProps & Props;

export const FormikTextFieldGroup = ({
  id,
  label,
  field,
  meta,
  inputProps,
}: FormikTextFieldGroupProps): React.ReactElement<Props> => (
  <ForwardedTextFieldGroup
    id={id}
    label={label}
    inputProps={{ ...inputProps, ...field }}
    errors={meta?.error ? [meta.error] : undefined}
  />
);
