import { connect } from 'react-redux';
import { createNotification, NOTIFICATION_TYPE_INFO } from 'react-redux-notify';
import Presenter from './presenter';


// import { createSelector } from 'reselect';
//
// const userSelector = createSelector(
//   state => state.userReducer,
//   userReducer => ({ ...userReducer })
// );
//
// const remoteIdentitiesSelector = createSelector(
//   state => state.remoteIdentityReducer,
//   remoteIdentityReducer => ({
//     remoteIdentities: remoteIdentityReducer
//       .remoteIdentities.map((id) => remoteIdentityReducer.remoteIdentitiesById[id]),
//   })
// );
// this.$scope.$on('$destroy', this.$ngRedux.connect(userSelector)(this));
// this.$scope.$on('$destroy', this.$ngRedux.connect(remoteIdentitiesSelector)(this));

const mapDispatchToProps = dispatch => ({
  onContactProfileChange: () => {
    dispatch(createNotification({
      message: 'Updating a contact is not yet available.',
      type: NOTIFICATION_TYPE_INFO,
      duration: 10000,
      canDismiss: true,
    }));
    // XXX: this.$ngRedux.dispatch(this.UserActions.updateUserContact(contact));
  },
  setMainAddress: () => {
    // TODO: API for main address
    // does caliopen instance address is in contact details (I suppose)
    // is primary available for all digital contact details and can be used as real primary ?
    dispatch(createNotification({
      message: 'Primary contact protocol/address definition is not yet implemented.',
      type: NOTIFICATION_TYPE_INFO,
      duration: 10000,
      canDismiss: true,
    }));
  },
});

export default connect(null, mapDispatchToProps)(Presenter);
