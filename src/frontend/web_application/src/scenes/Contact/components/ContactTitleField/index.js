import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import Presenter from './presenter';
import { settingsSelector } from '../../../../store/selectors/settings';

const formValuesSelector = (state, ownProps) =>
  getFormValues(ownProps.form)(state);

const mapStateToProps = createSelector(
  [settingsSelector, formValuesSelector],
  ({ contact_display_format: contactDisplayFormat }, formValues) => ({
    contactDisplayFormat,
    contact: formValues,
  })
);

export default connect(mapStateToProps)(Presenter);
