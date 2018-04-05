import { createSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from 'lingui-react';
import { getFormValues } from 'redux-form';
import Presenter from './presenter';
import { settingsSelector } from '../../../../store/selectors/settings';

const formValuesSelector = (state, ownProps) => getFormValues(ownProps.form)(state);

const mapStateToProps = createSelector(
  [settingsSelector, formValuesSelector],
  ({ contact_display_format: contactDisplayFormat }, formValues) => ({
    contactDisplayFormat,
    contact: formValues,
  })
);

export default compose(
  connect(mapStateToProps),
  withI18n()
)(Presenter);
