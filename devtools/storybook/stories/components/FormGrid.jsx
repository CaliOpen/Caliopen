import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { FormGrid, FormRow, FormColumn } from '../../src/components/form';
import { Code, ComponentWrapper } from '../presenters';

const styles = {
  formColumnSizedFuild: {
    border: '1px solid #881f0e',
  },
  formColumnSmall: {
    backgroundColor: '#ec5840',
    border: '1px solid #881f0e',
  },
  formColumnNormal: {
    backgroundColor: '#eee',
    border: '1px solid #1395ba',
  },
  formColumnShrink: {
    backgroundColor: '#3adb76',
    border: '1px solid #157539',
  },
  formColumnMedium: {
    backgroundColor: '#1395ba',
    border: '1px solid #0a4b5d',
  },
  formColumnLarge: {
    backgroundColor: '#ff0',
    border: '1px solid #ffae00',
  },
  formColumnFluid: {
    backgroundColor: '#424242',
    border: '1px solid #8a8a8a',
  },
};

class Presenter extends Component {
  render() {
    return (
      <div>
        <ComponentWrapper>
          <FormGrid>
            <FormRow>
              <FormColumn style={styles.formColumnNormal}>Col normal</FormColumn>
              <FormColumn style={styles.formColumnNormal}>Col normal</FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn size="shrink" style={styles.formColumnShrink}>Col shrink</FormColumn>
              <FormColumn size="large" style={styles.formColumnLarge}>Col large</FormColumn>
              <FormColumn style={styles.formColumnNormal}>Col normal</FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn size="medium" style={styles.formColumnMedium}>Col medium</FormColumn>
              <FormColumn size="medium" style={styles.formColumnMedium}>Col medium</FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn size="small" style={styles.formColumnSmall}>Col small</FormColumn>
              <FormColumn size="small" style={styles.formColumnSmall}>Col small</FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn size="small" fluid style={styles.formColumnSizedFuild}>Col small fluid</FormColumn>
              <FormColumn size="small" fluid style={styles.formColumnSizedFuild}>Col small fluid</FormColumn>
              <FormColumn size="small" style={styles.formColumnSmall}>Col small</FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn fluid style={styles.formColumnFluid}>Col fluid</FormColumn>
              <FormColumn fluid style={styles.formColumnFluid}>Col fluid</FormColumn>
            </FormRow>
          </FormGrid>
        </ComponentWrapper>
        <Code>
          {`
import { FormGrid, FormRow, FormColumn } from './src/components/form';

export default () => (
  <FormGrid>
    <FormRow>
      <FormColumn>Col normal</FormColumn>
      <FormColumn>Col normal</FormColumn>
    </FormRow>
    <FormRow>
      <FormColumn size="shrink">Col shrink</FormColumn>
      <FormColumn size="large">Col large</FormColumn>
      <FormColumn>Col normal</FormColumn>
    </FormRow>
    <FormRow>
      <FormColumn size="medium">Col medium</FormColumn>
      <FormColumn size="medium">Col medium</FormColumn>
    </FormRow>
    <FormRow>
      <FormColumn size="small">Col small</FormColumn>
      <FormColumn size="small">Col small</FormColumn>
    </FormRow>
  </FormGrid>
);
          `}
        </Code>
      </div>
    );
  }
}

export default Presenter;
