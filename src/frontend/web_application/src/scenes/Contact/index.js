import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  requestContact,
  createContact,
  deleteContact,
  invalidate as invalidateContacts,
} from '../../store/modules/contact';
import { requestUser } from '../../store/modules/user';
import {
  addAddressToContact,
  updateContact,
  getContact,
} from '../../modules/contact';
import { updateTagCollection as updateTagCollectionBase } from '../../modules/tags';
import { getNewContact } from '../../services/contact';
import { userSelector } from '../../modules/user';
import { withSearchParams } from '../../modules/routing';
import { contactValidation } from './services/contactValidation';
import Presenter from './presenter';

const contactIdSelector = (state, ownProps) => ownProps.match.params.contactId;
const contactSelector = (state) => state.contact;
const dirtyValuesSelector = createSelector(
  [(state, ownProps) => ownProps.searchParams],
  ({ address, protocol, label }) => ({ address, protocol, label })
);

const mapStateToProps = createSelector(
  [userSelector, contactIdSelector, contactSelector, dirtyValuesSelector],
  (user, contactId, contactState, dirtyValues) => {
    const contact = contactState.contactsById[contactId] || getNewContact();
    const { address, protocol, label } = dirtyValues;

    return {
      user,
      contactId,
      contact,
      form: `contact-${contactId || 'new'}`,
      // TODO: the following key fix this bug: https://github.com/erikras/redux-form/issues/2886#issuecomment-299426767
      key: `contact-${contactId || 'new'}`,
      initialValues: {
        ...contact,
        ...(protocol
          ? addAddressToContact(contact, { address, protocol })
          : {}),
        ...(label &&
        label.length > 0 &&
        (!contact.given_name || !contact.given_name.length) &&
        (!contact.family_name || !contact.family_name.length)
          ? { given_name: label }
          : {}),
      },
      isFetching: contactState.isFetching,
    };
  }
);

const updateTagCollection = (
  i18n,
  { type, entity, tags: tagCollection, lazy }
) => async (dispatch, getState) => {
  const result = await dispatch(
    updateTagCollectionBase(i18n, {
      type,
      entity,
      tags: tagCollection,
      lazy,
    })
  );

  const userContact = userSelector(getState()).contact;

  if (userContact.contact_id === entity.contact_id) {
    dispatch(requestUser());
  }

  return result;
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      requestContact,
      getContact,
      updateContact,
      createContact,
      deleteContact,
      invalidateContacts,
      updateTagCollection,
    },
    dispatch
  ),
  onSubmit: (values) => Promise.resolve(values),
});

export default compose(
  withSearchParams(),
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    destroyOnUnmount: false,
    enableReinitialize: true,
    validate: contactValidation,
  })
)(Presenter);
