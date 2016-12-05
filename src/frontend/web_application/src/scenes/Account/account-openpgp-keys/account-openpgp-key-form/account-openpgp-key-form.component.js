class AccountOpenPGPKeyFormController {
  $onInit() {
    this.generateForm = { ...this.generateForm };
    this.importForm = {};
    this.formType = 'generate';
  }

  $onChanges(changes) {
    if (changes.emails && !!this.emails) {
      this.emailOptions = this.emails.map(email => email.address);
      if (this.emailOptions.length === 1) {
        this.generateForm = { ...this.generateForm, email: this.emailOptions[0] };
      }
    }
  }

  handleImportChanges(property, $event) {
    this.importForm = { ...this.importForm, [property]: $event.model };
  }

  handleGenerateChanges(property, $event) {
    this.generateForm = { ...this.generateForm, [property]: $event.model };
  }

  generate() {
    this.onGenerate({ $event: this.generateForm });
  }

  import() {
    this.onImport({ $event: this.importForm });
  }
}

const AccountOpenPGPKeyFormComponent = {
  bindings: {
    emails: '<',
    onImport: '&',
    onGenerate: '&',
    importForm: '<',
    isLoading: '<',
  },
  transclude: {
    icon: 'icon',
  },
  controller: AccountOpenPGPKeyFormController,
  template: `
    <div class="m-account-openpgp-form">
      <div class="m-account-openpgp-form__main">
        <span ng-transclude="icon"></span>

        <div class="m-account-openpgp-form__switch-mode-container">
          <a href
            ng-click="$ctrl.formType = 'generate'"
            class="m-link m-link--button"
            ng-class="{'m-link--hollow': $ctrl.formType === 'generate'}"
          >
            {{ 'account.openpgp.action.switch-generate-key'|translate }}
          </a>
          <a href
            ng-click="$ctrl.formType = 'raw'"
            class="m-link m-link--button"
            ng-class="{'m-link--hollow': $ctrl.formType === 'raw'}"
          >
            {{ 'account.openpgp.action.switch-import-raw-key'|translate }}
          </a>
        </div>
      </div>
      <div ng-switch="$ctrl.formType">
        <div ng-switch-default>
          <form ng-submit="$ctrl.generate()">
            <div
              ng-if="$ctrl.emailOptions.length !== 1"
              class="m-account-openpgp-form__field-group"
            >
              <select-field-group
                label="'account.openpgp.form.email.label'|translate"
                model="$ctrl.generateForm.email"
                on-change="$ctrl.handleGenerateChanges('email', $event)"
                options="$ctrl.emailOptions"
                required="true"
              ></select-field-group>
            </div>
            <p ng-if="$ctrl.emailOptions.length === 1" class="m-account-openpgp-form__field-group">
              {{ 'account.openpgp.form.email.label'|translate}} {{ $ctrl.generateForm.email }}
            </p>
            <div class="m-account-openpgp-form__field-group">
              <label>
                <input type="checkbox" ng-model="$ctrl.hasPassphrase" value="1" />
                {{ 'account.openpgp.has-passphrase'|translate }}
              </label>
            </div>
            <div
              ng-if="$ctrl.hasPassphrase"
              class="m-account-openpgp-form__field-group"
            >
              <text-field-group
                label="'account.openpgp.form.passphrase.label'|translate"
                model="$ctrl.generateForm.passphrase"
                on-change="$ctrl.handleGenerateChanges('passphrase', $event)"
              ></text-field-group>
            </div>
            <div class="m-account-openpgp-form__field-group">
              <button type="submit" class="button">
                <spinner loading="$ctrl.isLoading"></spinner>
                {{ 'account.openpgp.action.create'|translate }}
              </button>
            </div>
          </form>
        </div>
        <div ng-switch-when="raw">
          <form ng-submit="$ctrl.import()">
            <div ng-if="$ctrl.importForm.errors.global" class="m-account-openpgp-form__field-group">
              <field-errors errors="$ctrl.importForm.errors.global"></field-errors>
            </div>
            <div class="m-account-openpgp-form__field-group">
              <textarea-field-group
                label="'account.openpgp.form.public-key.label'|translate"
                model="$ctrl.importForm.publicKeyArmored"
                on-change="$ctrl.handleImportChanges('publicKeyArmored', $event)"
                errors="$ctrl.importForm.errors.publicKeyArmored"
              ></textarea-field-group>
            </div>
            <div class="m-account-openpgp-form__field-group">
              <textarea-field-group
                label="'account.openpgp.form.private-key.label'|translate"
                model="$ctrl.importForm.privateKeyArmored"
                on-change="$ctrl.handleImportChanges('privateKeyArmored', $event)"
                errors="$ctrl.importForm.errors.privateKeyArmored"
              ></textarea-field-group>
            </div>
            <div class="m-account-openpgp-form__field-group">
              <button type="submit" class="button">
                <spinner loading="$ctrl.isLoading"></spinner>
                {{ 'account.openpgp.action.add'|translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
};

export default AccountOpenPGPKeyFormComponent;
