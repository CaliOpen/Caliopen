import { createSelector } from 'reselect';

const privateKeysSelector = createSelector(
  state => state.openPGPKeychainReducer,
  openPGPKeychainState => ({
    privateKeys: openPGPKeychainState.privateKeys
      .map(fingerprint => openPGPKeychainState.keychainByFingerprint[fingerprint]),
  })
);

const importKeyChainsErrorSelector = createSelector(
  state => state.openPGPKeychainReducer,
  openPGPKeychainState => ({
    importForm: openPGPKeychainState.importForm,
    isLoading: openPGPKeychainState.isLoading,
  })
);

class AccountOpenPGPKeysController {
  constructor($scope, $ngRedux, OpenPGPActions, OpenPGPManager) {
    'ngInject';
    this.$scope = $scope;
    this.$ngRedux = $ngRedux;
    this.OpenPGPActions = OpenPGPActions;
    this.OpenPGPManager = OpenPGPManager;
  }

  $onInit() {
    this.$scope.$on('$destroy', this.$ngRedux.connect(privateKeysSelector)(this));
    this.$scope.$on('$destroy', this.$ngRedux.connect(importKeyChainsErrorSelector)(this));
    this.$ngRedux.dispatch(this.OpenPGPActions.fetchAll());
  }

  deleteKey({ fingerprint }) {
    this.$ngRedux.dispatch(this.OpenPGPActions.deleteKey(fingerprint));
  }

  generateKeys($event) {
    const { contact: { title: name } } = this.user;
    const { email, passphrase } = $event;

    this.$ngRedux.dispatch(this.OpenPGPActions.generate(name, email, passphrase));
  }

  addArmoredKeys({ publicKeyArmored, privateKeyArmored }) {
    this.$ngRedux.dispatch(
      this.OpenPGPActions.importKeyPairChains(publicKeyArmored, privateKeyArmored)
    );
  }
}

const AccountOpenPGPKeysComponent = {
  bindings: {
    user: '<',
  },
  controller: AccountOpenPGPKeysController,
  template: `
    <div class="m-account-openpgp">
      <subtitle props="{ hr: true }">
        <text>{{ 'account.openpgp.title'|translate }}</text>
        <actions>
          <button class="m-link m-link--button pull-right"
            ng-class="{ 'active': !!$ctrl.editMode }"
            ng-click="$ctrl.editMode = !$ctrl.editMode"
          >
            <i class="fa fa-edit"></i>
            <span class="show-for-sr">{{ 'account.openpgp.action.edit-keys'|translate }}</span>
          </button>
        </actions>
      </subtitle>
      <div class="m-account-openpgp__info">
        <p>
          This feature is in high development process and can evolve quickly.
          The keys you will store here are available on your current browser only. This will not be
          uploaded on the server and you will not able to see it on any other devices.
        </p>
        <p>
          Be warned, the key pair generation is pretty slow and will freeze this page for
          approximatively 20 seconds (depends on your device capacities).
          A fix is in progress but may takes time to become available.
        </p>
      </div>
      <div class="m-account-openpgp__keys">
        <openpgp-key
          ng-repeat="keyPair in $ctrl.privateKeys"
          public-key-armored="keyPair.publicKeyArmored"
          private-key-armored="keyPair.privateKeyArmored"
          edit-mode="$ctrl.editMode"
          on-delete-key="$ctrl.deleteKey($event)"
        >
          <icon>
            <span class="fa fa-key"></span>
          </icon>
        </openpgp-key>
      </div>
      <div class="m-account-openpgp__form" ng-if="$ctrl.editMode">
        <account-openpgp-key-form
          emails="$ctrl.user.contact.emails"
          on-import="$ctrl.addArmoredKeys($event)"
          on-generate="$ctrl.generateKeys($event)"
          import-form="$ctrl.importForm"
          is-loading="$ctrl.isLoading"
        >
          <icon>
            <span class="fa fa-key"></span>
          </icon>
        </account-openpgp-key-form>
      </div>
    </div>
  `,
};

export default AccountOpenPGPKeysComponent;
