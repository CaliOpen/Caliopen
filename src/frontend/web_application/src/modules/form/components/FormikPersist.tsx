import * as React from 'react';
import { FormikConsumer, FormikErrors } from 'formik';

function clear(key) {
  sessionStorage.removeItem(key);
}

type FormikPersistorProps = {
  name: string;
  values: Record<string, string>;
  errors: FormikErrors<any>;
  setValues: (values: Record<string, string>) => void;
  setErrors: (errors: Record<string, string>) => void;
};

function FormikPersistor({
  name,
  setValues,
  setErrors,
  values,
  errors,
}: FormikPersistorProps) {
  const storageKey = `formik.form.${name}`;
  React.useLayoutEffect(() => {
    window.addEventListener('beforeunload', clear);
  }, []);

  React.useEffect(() => {
    const data = sessionStorage.getItem(storageKey);

    if (data) {
      const { values: storedValue, errors: storedError } = JSON.parse(data);
      setValues(storedValue);
      setErrors(storedError);
    }

    return () => {
      window.removeEventListener('beforeunload', clear);
    };
  }, []);

  React.useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify({ values, errors }));
  }, [values, errors]);

  return null;
}

const FormikPersist = ({
  name,
}: {
  name: string;
}): React.ReactElement<typeof FormikConsumer> => (
  <FormikConsumer>
    {({ values, errors, setValues, setErrors }) => (
      <FormikPersistor
        name={name}
        setValues={setValues}
        setErrors={setErrors}
        values={values}
        errors={errors}
      />
    )}
  </FormikConsumer>
);

export default FormikPersist;
