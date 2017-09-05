import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { formValues } from 'redux-form';
import Presenter from './presenter';

const mapDispatchToProps = dispatch => bindActionCreators({ }, dispatch);

export default compose(
  connect(null, mapDispatchToProps),
  formValues('country'),
  withTranslator()
)(Presenter);
