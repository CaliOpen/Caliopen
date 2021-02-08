import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { reduxForm } from 'redux-form';
import { withNotification } from '../../modules/userNotify';
import Presenter from './presenter';
import { requestSettings, updateSettings } from '../../store/modules/settings';
import { settingsSelector } from '../../store/selectors/settings';

const mapStateToProps = createSelector([settingsSelector], (settings) => ({
  initialValues: settings,
}));

const normalizeValues = (values) => ({
  ...values,
  notification_delay_disappear: Number.parseInt(
    values.notification_delay_disappear,
    10
  ),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestSettings,
      onSubmit: (values, disp, props) =>
        updateSettings({
          settings: normalizeValues(values),
          original: props.initialValues,
        }),
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withI18n(),
  withNotification(),
  reduxForm({
    form: 'settings-application',
    enableReinitialize: true,
  })
)(Presenter);
