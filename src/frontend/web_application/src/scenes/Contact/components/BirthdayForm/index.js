import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { autofill } from 'redux-form';
import Presenter from './presenter';

// const formSelector = state => state.form;
// const formNameSelector = (state, ownProps) => ownProps.form;

const mapStateToProps = createSelector(
  [],
  () => ({
  })
);
const mapDispatchToProps = dispatch => bindActionCreators({
  changeField: autofill,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslator()
)(Presenter);
