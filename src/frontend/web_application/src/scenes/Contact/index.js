import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, formValues } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import { push } from 'react-router-redux';
import { requestContact, updateContact, createContact, deleteContact, invalidate as invalidateContacts } from '../../store/modules/contact';
import { withSettings } from '../../hoc/settings';
import { withNotification } from '../../hoc/notification';
import { removeTab, updateTab } from '../../store/modules/tab';
import { getNewContact } from '../../services/contact';
import { withCurrentTab } from '../../hoc/tab';
import { settingsSelector } from '../../store/selectors/settings';
import Presenter from './presenter';

const contactIdSelector = (state, ownProps) => ownProps.match.params.contactId;
const contactSelector = state => state.contact;
const userSelector = state => state.user;

const mapStateToProps = createSelector(
  [userSelector, contactIdSelector, contactSelector, settingsSelector],
  (userState, contactId, contactState, { contact_display_format }) => ({
    user: userState.user,
    contactId,
    contact: contactState.contactsById[contactId],
    form: `contact-${contactId || 'new'}`,
    // TODO: the following key fix this bug: https://github.com/erikras/redux-form/issues/2886#issuecomment-299426767
    key: `contact-${contactId || 'new'}`,
    initialValues: contactState.contactsById[contactId] || getNewContact(),
    isFetching: contactState.isFetching,
    contact_display_format,
  })
);

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    requestContact,
    updateContact,
    createContact,
    deleteContact,
    invalidateContacts,
    removeTab,
    updateTab,
    push,
  }, dispatch),
  onSubmit: values => Promise.resolve(values),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    destroyOnUnmount: false,
    enableReinitialize: true,
  }),
  formValues({ birthday: 'info.birthday' }),
  withTranslator(),
  withCurrentTab(),
  withSettings(),
  withNotification(),
)(Presenter);
