import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';

const computeKey = (name: string): string => `formik.form.${name}`;

export function clearPersisted(name: string) {
  const key = computeKey(name);
  sessionStorage.removeItem(key);
}

type FormikPersistorProps<Values> = {
  name: string;
  values: Values;
  errors: FormikErrors<any>;
  setValues: (values: Values) => void;
  setErrors: (errors: FormikErrors<Values>) => void;
};

function FormikPersistor<Values = Record<string, string>>({
  name,
  setValues,
  setErrors,
  values,
  errors,
}: FormikPersistorProps<Values>) {
  const storageKey = computeKey(name);
  React.useLayoutEffect(() => {
    window.addEventListener('beforeunload', () => clearPersisted(name));
  }, []);

  React.useEffect(() => {
    const data = sessionStorage.getItem(storageKey);

    if (data) {
      const { values: storedValue, errors: storedError } = JSON.parse(data);
      setValues(storedValue);
      setErrors(storedError);
    }

    return () => {
      window.removeEventListener('beforeunload', () => clearPersisted(name));
    };
  }, []);

  React.useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify({ values, errors }));
  }, [values, errors]);

  return null;
}

function FormikPersist<Values = Record<string, string>>({
  name,
}: {
  name: string;
}): React.ReactElement<typeof FormikPersistor> {
  const { values, errors, setValues, setErrors } = useFormikContext<Values>();
  return (
    <FormikPersistor
      name={name}
      setValues={setValues}
      setErrors={setErrors}
      values={values}
      errors={errors}
    />
  );
}

export default FormikPersist;
