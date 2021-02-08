import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { formValues } from 'redux-form';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default compose(
  connect(null, mapDispatchToProps),
  formValues('country'),
  withI18n()
)(Presenter);
