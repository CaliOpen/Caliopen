import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withI18n } from '@lingui/react';
import { withNotification } from '../../modules/userNotify';
import { withUser } from '../../hoc/user';
import { requestUser, updateUser } from '../../store/modules/user';
import { updateContact } from '../../store/modules/contact';
import Presenter from './presenter';

const userSelector = (state) => state.user;
const contactIdSelector = (state, ownProps) => ownProps.match.params.contactId;

const mapStateToProps = createSelector(
  [userSelector, contactIdSelector],
  (userState) => ({
    isFetching: userState.isFetching,
    initialValues: userState.user,
  })
);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestUser,
      updateUser,
      onSubmit: (values, disp, props) =>
        updateContact({
          contact: values.contact,
          original: props.initialValues.contact,
        }),
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withUser(),
  withI18n(),
  withNotification(),
  reduxForm({
    form: 'user-profile',
    enableReinitialize: true,
  })
)(Presenter);
