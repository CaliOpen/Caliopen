// TODEL

import * as React from 'react';
import { Trans } from '@lingui/react';
import { Field, FieldArray } from 'formik';
import { Button, FormGrid, FormRow, FormColumn } from 'src/components';
import TextList, { TextItem } from 'src/components/TextList';

export interface ItemProps {
  name: string;
  onDelete: () => void;
}
interface Props {
  propertyName: string;
  component: React.ComponentType<ItemProps>;
  showAdd?: boolean;
}
function FormCollection({
  propertyName,
  component: C,
  showAdd,
}: Props): React.ReactElement<typeof FieldArray> {
  // static propTypes = {
  //   propertyName: PropTypes.string.isRequired,
  //   component: PropTypes.element.isRequired,
  //   showAdd: PropTypes.bool,
  //   addButtonLabel: PropTypes.node,
  //   validate: PropTypes.func,
  //   defaultValues: PropTypes.shape({}),
  // };

  // static defaultProps = {
  //   showAdd: true,
  //   addButtonLabel: undefined,
  //   validate: undefined,
  //   defaultValues: {},
  // };

  return (
    <FieldArray
      name={propertyName}
      render={({ form, remove }) => (
        <TextList>
          {form.values[propertyName]?.map((item, index) => (
            <TextItem key={index} large>
              {/* <FormSection name={fieldName}> */}
              <C
                name={`${propertyName}.${index}`}
                onDelete={() => remove(index)}
              />
              {/* </FormSection> */}
            </TextItem>
          ))}
          {/* {showAdd && (
              <TextItem large>
                <FormGrid>
                  <FormRow>
                    <FormColumn>
                      <Button
                        icon="plus"
                        shape="plain"
                        onClick={() => fields.push({ ...defaultValues })}
                      >
                        {addButtonLabel || (
      <Trans id="contact.action.add_new_field">Add new</Trans>)}
                      </Button>
                    </FormColumn>
                  </FormRow>
                </FormGrid>
              </TextItem>
            )} */}
        </TextList>
      )}
      // validate={validate}
    />
  );
}

export default FormCollection;
