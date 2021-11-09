import * as React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { FieldArray, FormSection } from 'redux-form';
import { Button, FormGrid, FormRow, FormColumn } from '../../../../components';
import TextList, { TextItem } from '../../../../components/TextList';

class FormCollection extends React.PureComponent {
  static propTypes = {
    propertyName: PropTypes.string.isRequired,
    component: PropTypes.element.isRequired,
    showAdd: PropTypes.bool,
    addButtonLabel: PropTypes.node,
    validate: PropTypes.func,
    defaultValues: PropTypes.shape({}),
  };

  static defaultProps = {
    showAdd: true,
    addButtonLabel: undefined,
    validate: undefined,
    defaultValues: {},
  };

  renderForms = ({ fields }) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'component' does not exist on type 'Reado... Remove this comment to see the full error message
    const { component, showAdd, addButtonLabel, defaultValues } = this.props;
    const addLabel = addButtonLabel || (
      <Trans id="contact.action.add_new_field">Add new</Trans>
    );

    return (
      // @ts-expect-error ts-migrate(2741) FIXME: Property 'className' is missing in type '{ childre... Remove this comment to see the full error message
      <TextList>
        {fields.map((fieldName, index) => (
          <TextItem key={index} large>
            <FormSection name={fieldName}>
              <component.type onDelete={() => fields.remove(index)} />
            </FormSection>
          </TextItem>
        ))}
        {showAdd && (
          <TextItem large>
            <FormGrid>
              <FormRow>
                <FormColumn>
                  <Button
                    icon="plus"
                    shape="plain"
                    onClick={() => fields.push({ ...defaultValues })}
                  >
                    {addLabel}
                  </Button>
                </FormColumn>
              </FormRow>
            </FormGrid>
          </TextItem>
        )}
      </TextList>
    );
  };

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'propertyName' does not exist on type 'Re... Remove this comment to see the full error message
    const { propertyName, validate } = this.props;

    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <FieldArray
        name={propertyName}
        component={this.renderForms}
        validate={validate}
      />
    );
  }
}

export default FormCollection;
