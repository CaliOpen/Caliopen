import { Trans } from '@lingui/react';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { Button, Spinner } from 'src/components';

export default function SubmitButton() {
  const { isSubmitting, isValid } = useFormikContext();

  return (
    <Button
      type="submit"
      display="expanded"
      shape="plain"
      disabled={!isValid || isSubmitting}
      icon={
        isSubmitting ? (
          <Spinner
            svgTitleId="signin-spinner"
            isLoading
            display="inline"
            theme="bright"
          />
        ) : undefined
      }
    >
      <Trans id="signin.action.login" message="Login" />
    </Button>
  );
}
