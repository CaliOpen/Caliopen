import React, { Component, PropTypes } from 'react';
import { withTranslator } from '@gandi/react-translate';
import Spinner from '../../components/Spinner';
import Icon from '../../components/Icon';
import ContactProfile from '../../components/ContactProfile';
import TextBlock from '../../components/TextBlock';
import { Switch } from '../../components/form';
import './style.scss';

@withTranslator()
class Account extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    onContactProfileChange: PropTypes.func.isRequired,
    setMainAddress: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      isFetching: true,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.loadUser();
    }, 2000);
  }

  loadUser() {
    this.setState({
      /* eslint-disable */
      user: {"family_name": null, "user_id": "344489c3-fc63-4e41-b490-5f4dd317aa50", "name": "test@caliopen.local", "privacy_features": {}, "main_user_id": null, "privacy_index": 0, "date_insert": "2016-05-09T15:01:39.924000",
        "contact": {
          "addresses": [], "privacy_features": {}, "phones": [], "contact_id": "19c3ce42-e3ba-46e7-984f-4c3e8de11c05", "date_insert": "2016-05-09T15:01:40.034000", "identities": [], "user_id": "344489c3-fc63-4e41-b490-5f4dd317aa50", "title": "John Doe", "additional_name": null, "date_update": null, "organizations": [], "ims": [], "given_name": "John", "name_prefix": null, "tags": [], "deleted": 0, "privacy_index": 0, "groups": [], "infos": {},
          "emails": [{"email_id": "93f03145-4398-4bd4-9bd5-00000100", "is_primary": 0, "date_update": null, "label": null, "address": "contact@john.doe", "date_insert": "2016-05-09T15:01:43.116000", "type": "other"}],
          "family_name": "Doe", "name_suffix": null, "avatar": "avatar.png", "public_keys": []
        },
        "params": {}, "given_name": null}
      /* eslint-enable */
    });
    this.setState({ isFetching: false });
  }

  // addContactDetail() {
  //   // TODO: manage redux dispatch here
  //   this.$ngRedux.dispatch(this.UserActions.invalidate());
  // }
  //
  // deleteContactDetail({ type, entity }) {
  //   const contactId = this.user.contact.contact_id;
  //   this.$ngRedux.dispatch(dispatch => {
  //     dispatch(this.ContactsActions.deleteContactDetail(type, contactId, entity));
  //     dispatch(this.UserActions.invalidate());
  //   });
  // }
  //
  // connectRemoteIdentity({ remoteIdentity }) {
  //   this.$ngRedux.dispatch((dispatch) => {
  //     if (!remoteIdentity.remote_identity_id) {
  //       dispatch(this.RemoteIdentityActions.addRemoteIdentity(remoteIdentity));
  //     } else {
  //       dispatch(this.RemoteIdentityActions.updateRemoteIdentityParams(remoteIdentity));
  //       dispatch(this.RemoteIdentityActions.connect(remoteIdentity));
  //     }
  //   });
  // }
  //
  // disconnectRemoteIdentity({ remoteIdentity }) {
  //   this.$ngRedux.dispatch(this.RemoteIdentityActions.disconnect(remoteIdentity));
  // }
  //

  render() {
    const contactDetailsProps = {
      remoteIdentity: {
        stylesheets: {
          formRow: 's-account__remote-identity-form-row',
          fieldGroup: 's-account__field-group--medium',
          buttons: 's-account__remote-identity-buttons',
          fetchingPanel: 's-account__remote-identity-fetching-panel',
          fetchingPanelContent: 's-account__remote-identity-fetching-panel-content',
        },
      },
    };

    const { onContactProfileChange, setMainAddress, __ } = this.props;

    return (
      <div>
        <Spinner isLoading={this.state.isFetching} />
        {
          this.state.user && (
          <div className="s-account">
            <div className="s-account__col-datas-irl">
              <ContactProfile
                className="s-account__contact-profile"
                contact={this.state.user.contact}
                onChange={onContactProfileChange}
              />

              <TextBlock>
                <Icon type="envelope" /> {this.state.user.name}
                <span className="pull-right">
                  {__('account.primary_email_label')}
                  {' '}
                  <Switch
                    label={__('account.action.is_primary')}
                    value={this.state.mainAddress}
                    onChange={setMainAddress}
                  />
                </span>
              </TextBlock>

              <div className="s-account__openpgp">
                {/* {XXX: openpgp, contactDetails ...} */}
                <account-openpgp-keys user="this.state.user" />
              </div>

            </div>
            <div className="s-contact__col-datas-online">
              <contact-details
                contact="this.state.user.contact"
                props={contactDetailsProps}
                on-add-contact-detail="$ctrl.addContactDetail($event)"
                on-delete-contact-detail="$ctrl.deleteContactDetail($event)"
                allow-connect-remote-entity="true"
                on-connect-remote-identity="$ctrl.connectRemoteIdentity($event)"
                on-disconnect-remote-identity="$ctrl.disconnectRemoteIdentity($event)"
                remote-identities="$ctrl.remoteIdentities"
              />
              <div className="s-contact__m-subtitle m-subtitle m-subtitle--hr">
                <h3 className="m-subtitle__text">
                  {__('contact.accounts')}
                </h3>
              </div>
              <ul className="m-text-list">
                { this.state.user.contact.identities.map((identity, key) => (
                  <li key={key} className="m-text-list__item m-text-list__item--large">
                    <span className="m-text-line">
                      <Icon className="m-text-list__icon" type="at" />
                      {identity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          )
        }
      </div>
    );
  }
}

export default Account;
