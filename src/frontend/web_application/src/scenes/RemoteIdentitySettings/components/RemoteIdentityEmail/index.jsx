import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withI18n } from '@lingui/react';
import { Trans } from '@lingui/macro'; // eslint-disable-line import/no-extraneous-dependencies
import { TextFieldGroup, CheckboxFieldGroup, FormGrid, FormRow, FormColumn, FieldErrors, Confirm, Button, Spinner, TextBlock } from '../../../../components';
import { REMOTE_IDENTITY_STATUS_ACTIVE, REMOTE_IDENTITY_STATUS_INACTIVE, PROTOCOL_EMAIL, Identity } from '../../../../modules/remoteIdentity';
import Status from '../Status';
import RemoteIdentityDetails from '../RemoteIdentityDetails';
import './style.scss';

function generateStateFromProps(props, prevState) {
  const {
    identity_id: identityId, infos, credentials = {}, status, protocol,
    identifier,
  } = props.remoteIdentity || {};
  const [inserverHostname = '', inserverPort = ''] = infos && infos.inserver ? infos.inserver.split(':') : [prevState.remoteIdentity.inserverHostname, prevState.remoteIdentity.inserverPort];
  const [outserverHostname = '', outserverPort = ''] = infos && infos.outserver ? infos.outserver.split(':') : [prevState.remoteIdentity.outserverHostname, prevState.remoteIdentity.outserverPort];
  const active = status ?
    status === REMOTE_IDENTITY_STATUS_ACTIVE :
    prevState.remoteIdentity.active;

  return {
    editing: !identityId,
    remoteIdentity: {
      ...prevState.remoteIdentity,
      ...(identifier ? { identifier } : {}),
      inserverHostname,
      inserverPort,
      outserverHostname,
      outserverPort,
      credentials,
      active,
      ...(protocol ? { protocol } : {}),
    },
  };
}

function getIdentityFromState(state, props) {
  const {
    remoteIdentity: {
      identifier, active, protocol,
      inserverHostname, inserverPort, inusername, inpassword,
      outserverHostname, outserverPort, outusername, outpassword,
    },
  } = state;
  const { remoteIdentity } = props;
  const credentials = (inusername || inpassword || outusername || outpassword) ? {
    ...(remoteIdentity.credentials ? remoteIdentity.credentials : {}),
    inusername,
    inpassword,
    outusername,
    outpassword,
  } : undefined;

  return new Identity({
    ...remoteIdentity,
    credentials,
    display_name: identifier,
    identifier,
    infos: {
      ...(remoteIdentity.infos ? remoteIdentity.infos : {}),
      inserver: `${inserverHostname}:${inserverPort}`,
      outserver: `${outserverHostname}:${outserverPort}`,
    },
    protocol,
    status: active ? REMOTE_IDENTITY_STATUS_ACTIVE : REMOTE_IDENTITY_STATUS_INACTIVE,
  });
}

@withI18n()
class RemoteIdentityEmail extends Component {
  static propTypes = {
    className: PropTypes.string,
    remoteIdentity: PropTypes.shape({}),
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onCancel: PropTypes.func,
    i18n: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    className: undefined,
    remoteIdentity: {},
    onDelete: () => {},
    onCancel: () => {},
  }

  static initialState = {
    editing: false,
    formErrors: {},
    advancedForm: false,
    remoteIdentity: {
      identifier: '',
      inserverHostname: '',
      inserverPort: '993',
      inusername: '',
      inpassword: '',
      outserverHostname: '',
      outserverPort: '465',
      outusername: '',
      outpassword: '',
      active: true,
      protocol: PROTOCOL_EMAIL,
    },
  };

  state = { ...this.constructor.initialState };

  componentWillMount() {
    this.init();
  }

  init = () => {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }
  reset = () => {
    this.setState(generateStateFromProps(this.props, { ...this.constructor.initialState }));
  }

  save = async () => {
    const { onChange, remoteIdentity } = this.props;
    try {
      await onChange({
        identity: getIdentityFromState(this.state, this.props),
      });
      if (remoteIdentity.identity_id) {
        this.reset();
      }
    } catch (errs) {
      if (errs.some(err => err.code === 6)) {
        this.setState({
          formErrors: { identifier: [(<Trans id="remote_identity.form.identifier.error.uniqueness">This address is already configured</Trans>)] },
        });
      } else {
        this.setState({
          formErrors: { global: errs.map(({ message }) => message) },
        });
      }
    }
  }

  handleSave = async () => {
    if (!this.validate()) {
      return;
    }

    this.save();
  }

  handleDelete = () => {
    const { remoteIdentity: identity } = this.props;

    this.props.onDelete({ identity });
  }

  handleCancel = () => {
    this.reset();
    // force usage of the callback using batching mecanism of setState
    this.setState(() => ({}), () => this.props.onCancel());
  }

  handleParamsChange = (event) => {
    const { name, value } = event.target;

    this.setState(prevState => ({
      remoteIdentity: {
        ...prevState.remoteIdentity,
        [name]: value,
      },
    }));
  }

  handleBlurIdentifier = () => {
    const { remoteIdentity } = this.props;

    if (remoteIdentity.entity_id) {
      return;
    }

    this.setState((prevState) => {
      if (prevState.remoteIdentity.inusername.length > 0) {
        return {};
      }

      return {
        remoteIdentity: {
          ...prevState.remoteIdentity,
          inusername: prevState.remoteIdentity.identifier,
          outusername: prevState.remoteIdentity.identifier,
        },
      };
    });
  }

  createHandleBlurInOutParam = shortname => () => {
    const { remoteIdentity } = this.props;

    if (remoteIdentity.entity_id) {
      return;
    }

    this.setState((prevState) => {
      if (prevState.remoteIdentity[`out${shortname}`].length > 0) {
        return {};
      }

      return {
        remoteIdentity: {
          ...prevState.remoteIdentity,
          [`out${shortname}`]: prevState.remoteIdentity[`in${shortname}`],
        },
      };
    });
  }

  handleActivate = (active) => {
    this.setState(prevState => ({
      remoteIdentity: {
        ...prevState.remoteIdentity,
        active,
      },
    }), () => {
      this.props.onChange({ identity: getIdentityFromState(this.state, this.props) });
    });
  }

  handleToggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
    }));
  }

  handlToggleAdvanced = () => {
    this.setState(prevState => ({
      advancedForm: !prevState.advancedForm,
    }));
  }

  validate = () => {
    let isValid = true;

    const phaseValidation = (properties) => {
      properties.forEach(({ formProperty, error }) => {
        const value = this.state.remoteIdentity[formProperty];

        if (!value || value.length === 0) {
          this.setState(prevState => ({
            formErrors: {
              ...prevState.formErrors,
              [formProperty]: [error],
            },
          }));
          isValid = false;
        } else {
          this.setState(prevState => ({
            formErrors: {
              ...prevState.formErrors,
              [formProperty]: [],
            },
          }));
        }
      });
    };

    const { remoteIdentity } = this.props;

    phaseValidation([
      { formProperty: 'identifier', error: <Trans id="remote_identity.form.identifier.error">a valid email is required</Trans> },
      { formProperty: 'inserverHostname', error: <Trans id="remote_identity.form.serverHostname.error">mail server is required</Trans> },
      { formProperty: 'inserverPort', error: <Trans id="remote_identity.form.serverPort.error">port is required</Trans> },
      { formProperty: 'outserverHostname', error: <Trans id="remote_identity.form.serverHostname.error">mail server is required</Trans> },
      { formProperty: 'outserverPort', error: <Trans id="remote_identity.form.serverPort.error">port is required</Trans> },
      { formProperty: 'protocol', error: <Trans id="remote_identity.form.protocol.error">protocol is required</Trans> },
      ...(!remoteIdentity.identity_id ||
          this.state.remoteIdentity.inusername.length > 0 ||
          this.state.remoteIdentity.inpassword.length > 0 ||
          this.state.remoteIdentity.outusername.length > 0 ||
          this.state.remoteIdentity.outpassword.length > 0 ?
        [
          { formProperty: 'inusername', error: <Trans id="remote_identity.form.username.error">login is required</Trans> },
          { formProperty: 'inpassword', error: <Trans id="remote_identity.form.password.error">password is required</Trans> },
          { formProperty: 'outusername', error: <Trans id="remote_identity.form.username.error">login is required</Trans> },
          { formProperty: 'outpassword', error: <Trans id="remote_identity.form.password.error">password is required</Trans> },
        ] : []
      ),
    ]);

    return isValid;
  }

  renderForm() {
    const { remoteIdentity, i18n } = this.props;

    return (
      <FormGrid>
        <FormRow>
          <FormColumn bottomSpace size="medium">
            <TextFieldGroup
              type="email"
              label={<Trans id="remote_identity.form.identifier.label">Email:</Trans>}
              placeholder={i18n._('remote_identity.form.identifier.placeholder', null, { defaults: 'john@doe.tld' })}
              value={this.state.remoteIdentity.identifier}
              errors={this.state.formErrors.identifier}
              onChange={this.handleParamsChange}
              onBlur={this.handleBlurIdentifier}
              name="identifier"
              // specificity of backend: the identifier and protocol are unique and immutable
              // cf. https://github.com/CaliOpen/Caliopen/blob/d6bbe43cc1098844f53eaec283e08c19c5f871bc/doc/specifications/identities/index.md#model
              disabled={remoteIdentity && remoteIdentity.identity_id && true}
              autoComplete="email"
              required
            />
          </FormColumn>
        </FormRow>
        {this.state.advancedForm && (
          <FormRow>
            <FormColumn bottomSpace>
              <TextBlock weight="strong"><Trans id="remote_identity.form.inserver">In server</Trans></TextBlock>
            </FormColumn>
          </FormRow>
        )}
        <FormRow>
          {/* <FormColumn bottomSpace size="medium">
            <SelectFieldGroup
              label={<Trans id="remote_identity.form.protocol.label">Protocol:</Trans>}
              value={this.state.remoteIdentity.protocol}
              options={MAIL_PROTOCOLS.map(key => ({ value: key, label: key }))}
              errors={this.state.formErrors.protocol}
              onChange={this.handleParamsChange}
              name="protocol"
              required
              disabled
            />
          </FormColumn> */}
          <FormColumn bottomSpace fluid>
            <TextFieldGroup
              label={<Trans id="remote_identity.form.incomming_mail_server.label">Incoming mail server:</Trans>}
              value={this.state.remoteIdentity.inserverHostname}
              errors={this.state.formErrors.inserverHostname}
              onChange={this.handleParamsChange}
              onBlur={this.createHandleBlurInOutParam('serverHostname')}
              name="inserverHostname"
              autoComplete="on"
              required
            />
          </FormColumn>
          <FormColumn bottomSpace size="shrink">
            <TextFieldGroup
              label={<Trans id="remote_identity.form.port.label">Port:</Trans>}
              value={this.state.remoteIdentity.inserverPort}
              errors={this.state.formErrors.inserverPort}
              onChange={this.handleParamsChange}
              name="inserverPort"
              type="number"
              autoComplete="on"
              required
            />
          </FormColumn>
        </FormRow>
        {!this.state.advancedForm && (
          <FormRow>
            <FormColumn bottomSpace fluid>
              <TextFieldGroup
                label={<Trans id="remote_identity.form.outgoing_mail_server.label">Outgoing mail server:</Trans>}
                value={this.state.remoteIdentity.outserverHostname}
                errors={this.state.formErrors.outserverHostname}
                onChange={this.handleParamsChange}
                name="outserverHostname"
                autoComplete="on"
                required
              />
            </FormColumn>
            <FormColumn bottomSpace size="shrink">
              <TextFieldGroup
                label={<Trans id="remote_identity.form.port.label">Port:</Trans>}
                value={this.state.remoteIdentity.outserverPort}
                errors={this.state.formErrors.outserverPort}
                onChange={this.handleParamsChange}
                name="outserverPort"
                type="number"
                autoComplete="on"
                required
              />
            </FormColumn>
          </FormRow>
        )}
        <FormRow>
          <FormColumn bottomSpace size="medium">
            <TextFieldGroup
              label={<Trans id="remote_identity.form.username.label">Login:</Trans>}
              value={this.state.remoteIdentity.inusername}
              errors={this.state.formErrors.inusername}
              onChange={this.handleParamsChange}
              onBlur={this.createHandleBlurInOutParam('username')}
              name="inusername"
              autoComplete="username"
              required
            />
          </FormColumn>
          <FormColumn bottomSpace size="medium">
            <TextFieldGroup
              label={<Trans id="remote_identity.form.password.label">Password:</Trans>}
              type="password"
              value={this.state.remoteIdentity.inpassword}
              errors={this.state.formErrors.inpassword}
              onChange={this.handleParamsChange}
              onBlur={this.createHandleBlurInOutParam('password')}
              name="inpassword"
              autoComplete="new-password"
              required
            />
          </FormColumn>
        </FormRow>
        {this.state.advancedForm && (
          <Fragment>
            <FormRow>
              <FormColumn bottomSpace>
                <TextBlock weight="strong"><Trans id="remote_identity.form.outserver">Out server</Trans></TextBlock>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn bottomSpace fluid>
                <TextFieldGroup
                  label={<Trans id="remote_identity.form.outgoing_mail_server.label">Outgoing mail server:</Trans>}
                  value={this.state.remoteIdentity.outserverHostname}
                  errors={this.state.formErrors.outserverHostname}
                  onChange={this.handleParamsChange}
                  name="outserverHostname"
                  autoComplete="on"
                  required
                />
              </FormColumn>
              <FormColumn bottomSpace size="shrink">
                <TextFieldGroup
                  label={<Trans id="remote_identity.form.port.label">Port:</Trans>}
                  value={this.state.remoteIdentity.outserverPort}
                  errors={this.state.formErrors.outserverPort}
                  onChange={this.handleParamsChange}
                  name="outserverPort"
                  type="number"
                  autoComplete="on"
                  required
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn bottomSpace size="medium">
                <TextFieldGroup
                  label={<Trans id="remote_identity.form.username.label">Login:</Trans>}
                  value={this.state.remoteIdentity.outusername}
                  errors={this.state.formErrors.outusername}
                  onChange={this.handleParamsChange}
                  name="outusername"
                  autoComplete="username"
                  required
                />
              </FormColumn>
              <FormColumn bottomSpace size="medium">
                <TextFieldGroup
                  label={<Trans id="remote_identity.form.password.label">Password:</Trans>}
                  type="password"
                  value={this.state.remoteIdentity.outpassword}
                  errors={this.state.formErrors.outpassword}
                  onChange={this.handleParamsChange}
                  name="outpassword"
                  autoComplete="new-password"
                  required
                />
              </FormColumn>
            </FormRow>
          </Fragment>
        )}
        {remoteIdentity && remoteIdentity.identity_id && (
          <FormRow>
            <FormColumn bottomSpace>
              <CheckboxFieldGroup
                checked={this.state.remoteIdentity.active}
                errors={this.state.formErrors.status}
                onChange={this.handleParamsChange}
                name="active"
                label={<Status status={this.state.remoteIdentity.active ? 'active' : 'inactive'} />}
                displaySwitch
                showTextLabel
              />
            </FormColumn>
          </FormRow>
        )}
      </FormGrid>
    );
  }

  renderGlobalError() {
    if (!this.state.formErrors.global) {
      return null;
    }

    return (
      <FieldErrors errors={this.state.formErrors.global} />
    );
  }

  renderContent() {
    const { remoteIdentity } = this.props;
    if (this.state.editing) {
      return this.renderForm();
    }


    return (
      <RemoteIdentityDetails
        remoteIdentity={remoteIdentity}
        active={this.state.remoteIdentity.active}
        onToggleActivate={this.handleActivate}
        onChange={this.handleChange}
        onDelete={this.handleDelete}
        onEdit={this.handleToggleEdit}
        onClear={this.handleClear}
      />
    );
  }

  renderActions() {
    const { remoteIdentity } = this.props;

    return (
      <div>
        {remoteIdentity.identity_id && (
          <Confirm
            title={<Trans id="remote_identity.confirm-delete.title">Delete the external account</Trans>}
            content={<Trans id="remote_identity.confirm-delete.content">The external account will deactivated then deleted.</Trans>}
            onConfirm={this.handleDelete}
            render={confirm => (
              <Button onClick={confirm} shape="plain" color="alert" className="m-remote-identity-email__action">
                <Trans id="remote_identity.action.delete">Delete</Trans>
              </Button>
            )}
          />
        )}
        {!this.state.editing && (
          <Button onClick={this.handleToggleEdit} shape="hollow" className="m-remote-identity-email__action">
            <Trans id="remote_identity.action.edit">Edit</Trans>
          </Button>
        )}
        {this.state.editing && (
          <Fragment>
            <Button onClick={this.handleCancel} shape="hollow" className="m-remote-identity-email__action">
              <Trans id="remote_identity.action.cancel">Cancel</Trans>
            </Button>
            <Button onClick={this.handlToggleAdvanced} shape="plain" className="m-remote-identity-email__action">
              {!this.state.advancedForm && (
                <Trans id="remote_identity.action.toggle-advanced-form">Advanced</Trans>
              )}
              {this.state.advancedForm && (
                <Trans id="remote_identity.action.toggle-simple-form">Simple</Trans>
              )}
            </Button>
            <Button
              onClick={this.handleSave}
              shape="plain"
              className="m-remote-identity-email__action"
              icon={this.state.hasActivity ? (<Spinner isloading display="inline" />) : 'email'}
              disabled={this.state.hasActivity}
            >
              <Trans id="remote_identity.action.save">Save</Trans>
            </Button>
          </Fragment>
        )}
      </div>
    );
  }

  render() {
    const { className } = this.props;

    return (
      <div className={classnames('m-remote-identity-email', className)}>
        {this.renderGlobalError()}
        {this.renderContent()}
        {this.renderActions()}
      </div>
    );
  }
}

export default RemoteIdentityEmail;
