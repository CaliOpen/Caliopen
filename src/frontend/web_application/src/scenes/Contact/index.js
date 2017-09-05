import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, formValues } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import { createNotification, NOTIFICATION_TYPE_ERROR } from 'react-redux-notify';
import { requestContact, updateContact } from '../../store/modules/contact';
import Presenter from './presenter';

const contactIdSelector = (state, ownProps) => ownProps.match.params.contactId;
const contactSelector = state => state.contact;

const mapStateToProps = createSelector(
  [contactIdSelector, contactSelector],
  (contactId, contactState) => ({
    contactId,
    contact: contactState.contactsById[contactId],
    form: `contact-${contactId}`,
    // TODO: the following key fix this bug: https://github.com/erikras/redux-form/issues/2886#issuecomment-299426767
    key: `contact-${contactId}`,
    initialValues: contactState.contactsById[contactId],
    isFetching: contactState.isFetching,
  })
);

const mapDispatchToProps = dispatch => bindActionCreators({
  requestContact,
  onSubmit: (values, disp, props) =>
    updateContact({ contact: values, original: props.initialValues }),
  updateContact,
  notifyError: message => createNotification({
    message,
    type: NOTIFICATION_TYPE_ERROR,
  }),
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    destroyOnUnmount: false,
    enableReinitialize: true,
  }),
  formValues({ birthday: 'info.birthday' }),
  withTranslator()
)(Presenter);
