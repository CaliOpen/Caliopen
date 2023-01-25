import * as React from 'react';
import classnames from 'classnames';
import './style.scss';
import { ErrorMessage } from 'formik';

interface Props {
  errors?: React.ReactNode;
  className?: string;
}

function FieldErrors({ errors, className }: Props) {
  let displayedErrors: React.ReactNode[];
  if (!Array.isArray(errors)) {
    displayedErrors = [errors];
  } else {
    displayedErrors = errors;
  }

  if (!displayedErrors || displayedErrors.length === 0) {
    return null;
  }

  return (
    <ul className={classnames('m-field-errors', className)}>
      {displayedErrors.map((error, idx) => (
        <li key={idx}>{error}</li>
      ))}
    </ul>
  );
}

interface FormikFieldErrorsProps {
  name: string;
}
export function FormikFieldErrors({ name }: FormikFieldErrorsProps) {
  return (
    <ErrorMessage name={name}>
      {(msg) => <FieldErrors errors={[msg]} />}
    </ErrorMessage>
  );
}

export default FieldErrors;
