// XXX: basic component structure for ContactList, almose same thing as DiscussionList
import React from 'react';

const contacts = [
  /* eslint-disable */
  {"contacts": {"addresses": [], "privacy_features": {}, "phones": [], "contact_id": "92d3727a-eefc-4537-b879-85f1c9d197bb", "date_insert": "2016-05-09T15:01:42.381000", "identities": [], "user_id": "344489c3-fc63-4e41-b490-5f4dd317aa50", "title": "bender", "additional_name": null, "date_update": null, "organizations": [], "ims": [], "given_name": null, "name_prefix": null, "tags": [], "deleted": 0, "privacy_index": 0, "groups": [], "infos": {}, "emails": [{"email_id": "93f03145-4398-4bd4-9bd5-00000001", "is_primary": 0, "date_update": null, "label": null, "address": "bender@caliopen.local", "date_insert": "2016-05-09T15:01:42.116000", "type": "other"}], "family_name": "bender", "name_suffix": null, "avatar": "avatar.png", "public_keys": []}},
  {"contacts": {"addresses": [], "privacy_features": {}, "phones": [], "contact_id": "0ba2e346-e4f8-4c45-9adc-eeb1d42f07e0", "date_insert": "2016-05-09T15:01:43.381000", "identities": [], "user_id": "344489c3-fc63-4e41-b490-5f4dd317aa50", "title": "zoidberg", "additional_name": null, "date_update": null, "organizations": [], "ims": [], "given_name": null, "name_prefix": null, "tags": [], "deleted": 0, "privacy_index": 0, "groups": [], "infos": {}, "emails": [{"email_id": "93f03145-4398-4bd4-9bd5-00000002", "is_primary": 0, "date_update": null, "label": null, "address": "zoidberg@caliopen.local", "date_insert": "2016-05-09T15:01:43.116000", "type": "other"}], "family_name": "zoidberg", "name_suffix": null, "avatar": "avatar.png", "public_keys": []}},
  {"contacts": {
    "addresses": [], "privacy_features": {}, "phones": [], "contact_id": "19c3ce42-e3ba-46e7-984f-4c3e8de11c05", "date_insert": "2016-05-09T15:01:40.034000", "identities": [], "user_id": "344489c3-fc63-4e41-b490-5f4dd317aa50", "title": "John Doe", "additional_name": null, "date_update": null, "organizations": [], "ims": [], "given_name": "John", "name_prefix": null, "tags": [], "deleted": 0, "privacy_index": 0, "groups": [], "infos": {},
    "emails": [{"email_id": "93f03145-4398-4bd4-9bd5-00000100", "is_primary": 0, "date_update": null, "label": null, "address": "contact@john.doe", "date_insert": "2016-05-09T15:01:43.116000", "type": "other"}],
    "family_name": "Doe", "name_suffix": null, "avatar": "avatar.png", "public_keys": []
  }},
  /* eslint-enable */
];

console.log(contacts);

const ContactList = () => (
  <div>
    {
      // XXX: old code based on angularJs

      // <spinner loading="$ctrl.isFetching"></spinner>
      // <ul class="s-contact-list m-block-list" infinite-scroll="$ctrl.loadMore()">
      //   <li ng-repeat="contact in $ctrl.contacts" class="m-block-list__item">
      //     <contact-item contact="contact"></contact-item>
      //   </li>
      //   <li class="s-contact-list__load-more m-block-list__item" ng-if="$ctrl.hasMore">
      //     <a ng-click="$ctrl.loadMore()" class="button hollow">
      //       {{ 'general.action.load_more'|translate }}
      //     </a>
      //   </li>
      // </ul>
    }
  </div>
);

export default ContactList;
