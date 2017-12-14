import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { reduxForm } from 'redux-form';
import Presenter from './presenter';
import { requestSettings, updateSettings } from '../../store/modules/settings';
import { settingsSelector } from '../../store/selectors/settings';

const mapStateToProps = createSelector(
  [settingsSelector],
  settings => ({
    initialValues: settings,
  })
);

const normalizeValues = values => ({
  ...values,
  notification_delay_disappear: Number.parseInt(values.notification_delay_disappear, 10),
});
const mapDispatchToProps = dispatch => bindActionCreators({
  requestSettings,
  onSubmit: (values, disp, props) => updateSettings({
    settings: normalizeValues(values), original: props.initialValues,
  }),
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslator(),
  reduxForm({
    form: 'settings-application',
    enableReinitialize: true,
  })
)(Presenter);
