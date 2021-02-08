import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { autofill } from 'redux-form';
import Presenter from './presenter';

// const formSelector = state => state.form;
// const formNameSelector = (state, ownProps) => ownProps.form;

const mapStateToProps = createSelector([], () => ({}));
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      changeField: autofill,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withI18n()
)(Presenter);
