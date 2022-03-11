import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withI18n, Trans } from '@lingui/react';
import {
  TextFieldGroup,
  CheckboxFieldGroup,
  FormGrid,
  FormRow,
  FormColumn,
  FieldErrors,
  Confirm,
  Button,
  Spinner,
  TextBlock,
} from '../../../../components';
import {
  REMOTE_IDENTITY_STATUS_ACTIVE,
  REMOTE_IDENTITY_STATUS_INACTIVE,
  PROTOCOL_EMAIL,
  Identity,
} from '../../../../modules/remoteIdentity';
import Status from '../Status';
import RemoteIdentityDetails from '../RemoteIdentityDetails';
import './style.scss';

function generateStateFromProps(props, prevState) {
  const {
    identity_id: identityId,
    infos,
    credentials = {},
    status,
    protocol,
    identifier,
  } = props.remoteIdentity || {};
  const [inserverHostname = '', inserverPort = ''] =
    infos && infos.inserver
      ? infos.inserver.split(':')
      : [
          prevState.remoteIdentity.inserverHostname,
          prevState.remoteIdentity.inserverPort,
        ];
  const [outserverHostname = '', outserverPort = ''] =
    infos && infos.outserver
      ? infos.outserver.split(':')
      : [
          prevState.remoteIdentity.outserverHostname,
          prevState.remoteIdentity.outserverPort,
        ];
  const active = status
    ? status === REMOTE_IDENTITY_STATUS_ACTIVE
    : prevState.remoteIdentity.active;

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
      identifier,
      active,
      protocol,
      inserverHostname,
      inserverPort,
      inusername,
      inpassword,
      outserverHostname,
      outserverPort,
      outusername,
      outpassword,
    },
  } = state;
  const { remoteIdentity } = props;
  const credentials =
    inusername || inpassword || outusername || outpassword
      ? {
          ...(remoteIdentity.credentials ? remoteIdentity.credentials : {}),
          inusername,
          inpassword,
          outusername,
          outpassword,
        }
      : undefined;

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
    status: active
      ? REMOTE_IDENTITY_STATUS_ACTIVE
      : REMOTE_IDENTITY_STATUS_INACTIVE,
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
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    className: undefined,
    remoteIdentity: {},
    onDelete: () => {
      // noop
    },
    onCancel: () => {
      // noop
    },
  };

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

  UNSAFE_componentWillMount() {
    this.init();
  }

  init = () => {
    this.setState((prevState) => generateStateFromProps(this.props, prevState));
  };

  reset = () => {
    this.setState(
      generateStateFromProps(this.props, { ...this.constructor.initialState })
    );
  };

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
      if (errs.some((err) => err.code === 6)) {
        this.setState({
          formErrors: {
            identifier: [
              <Trans
                id="remote_identity.form.identifier.error.uniqueness"
                message="This address is already configured"
              />,
            ],
          },
        });
      } else {
        this.setState({
          formErrors: { global: errs.map(({ message }) => message) },
        });
      }
    }
  };

  handleSave = async () => {
    if (!this.validate()) {
      return;
    }

    this.save();
  };

  handleDelete = () => {
    const { remoteIdentity: identity } = this.props;

    this.props.onDelete({ identity });
  };

  handleCancel = () => {
    this.reset();
    // force usage of the callback using batching mecanism of setState
    this.setState(
      () => ({}),
      () => this.props.onCancel()
    );
  };

  handleParamsChange = (event) => {
    const { name, value } = event.target;

    this.setState((prevState) => ({
      remoteIdentity: {
        ...prevState.remoteIdentity,
        [name]: value,
      },
    }));
  };

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
  };

  createHandleBlurInOutParam = (shortname) => () => {
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
  };

  handleActivate = (active) => {
    this.setState(
      (prevState) => ({
        remoteIdentity: {
          ...prevState.remoteIdentity,
          active,
        },
      }),
      () => {
        this.props.onChange({
          identity: getIdentityFromState(this.state, this.props),
        });
      }
    );
  };

  handleToggleEdit = () => {
    this.setState((prevState) => ({
      editing: !prevState.editing,
    }));
  };

  handlToggleAdvanced = () => {
    this.setState((prevState) => ({
      advancedForm: !prevState.advancedForm,
    }));
  };

  validate = () => {
    let isValid = true;

    const phaseValidation = (properties) => {
      properties.forEach(({ formProperty, error }) => {
        const value = this.state.remoteIdentity[formProperty];

        if (!value || value.length === 0) {
          this.setState((prevState) => ({
            formErrors: {
              ...prevState.formErrors,
              [formProperty]: [error],
            },
          }));
          isValid = false;
        } else {
          this.setState((prevState) => ({
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
      {
        formProperty: 'identifier',
        error: (
          <Trans
            id="remote_identity.form.identifier.error"
            message="a valid email is required"
          />
        ),
      },
      {
        formProperty: 'inserverHostname',
        error: (
          <Trans
            id="remote_identity.form.serverHostname.error"
            message="mail server is required"
          />
        ),
      },
      {
        formProperty: 'inserverPort',
        error: (
          <Trans
            id="remote_identity.form.serverPort.error"
            message="port is required"
          />
        ),
      },
      {
        formProperty: 'outserverHostname',
        error: (
          <Trans
            id="remote_identity.form.serverHostname.error"
            message="mail server is required"
          />
        ),
      },
      {
        formProperty: 'outserverPort',
        error: (
          <Trans
            id="remote_identity.form.serverPort.error"
            message="port is required"
          />
        ),
      },
      {
        formProperty: 'protocol',
        error: (
          <Trans
            id="remote_identity.form.protocol.error"
            message="protocol is required"
          />
        ),
      },
      ...(!remoteIdentity.identity_id ||
      this.state.remoteIdentity.inusername.length > 0 ||
      this.state.remoteIdentity.inpassword.length > 0 ||
      this.state.remoteIdentity.outusername.length > 0 ||
      this.state.remoteIdentity.outpassword.length > 0
        ? [
            {
              formProperty: 'inusername',
              error: (
                <Trans
                  id="remote_identity.form.username.error"
                  message="login is required"
                />
              ),
            },
            {
              formProperty: 'inpassword',
              error: (
                <Trans
                  id="remote_identity.form.password.error"
                  message="password is required"
                />
              ),
            },
            {
              formProperty: 'outusername',
              error: (
                <Trans
                  id="remote_identity.form.username.error"
                  message="login is required"
                />
              ),
            },
            {
              formProperty: 'outpassword',
              error: (
                <Trans
                  id="remote_identity.form.password.error"
                  message="password is required"
                />
              ),
            },
          ]
        : []),
    ]);

    return isValid;
  };

  renderForm() {
    const { remoteIdentity, i18n } = this.props;

    return (
      <FormGrid>
        <FormRow>
          <FormColumn bottomSpace size="medium">
            <TextFieldGroup
              inputProps={{
                type: 'email',
                placeholder: i18n._(
                  /* i18n */ 'remote_identity.form.identifier.placeholder',
                  null,
                  { message: 'john@doe.tld' }
                ),
                value: this.state.remoteIdentity.identifier,
                onChange: this.handleParamsChange,
                onBlur: this.handleBlurIdentifier,
                name: 'identifier',
                // specificity of backend: the identifier and protocol are unique and immutable
                // cf. https://github.com/CaliOpen/Caliopen/blob/d6bbe43cc1098844f53eaec283e08c19c5f871bc/doc/specifications/identities/index.md#model
                disabled: remoteIdentity && remoteIdentity.identity_id && true,
                autoComplete: 'email',
                required: true,
              }}
              label={
                <Trans
                  id="remote_identity.form.identifier.label"
                  message="Email:"
                />
              }
              errors={this.state.formErrors.identifier}
            />
          </FormColumn>
        </FormRow>
        {this.state.advancedForm && (
          <FormRow>
            <FormColumn bottomSpace>
              <TextBlock weight="strong">
                <Trans id="remote_identity.form.inserver" message="In server" />
              </TextBlock>
            </FormColumn>
          </FormRow>
        )}
        <FormRow>
          {/* <FormColumn bottomSpace size="medium">
            <SelectFieldGroup
              label={<Trans id="remote_identity.form.protocol.label" message="Protocol:" />}
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
              inputProps={{
                value: this.state.remoteIdentity.inserverHostname,
                onChange: this.handleParamsChange,
                onBlur: this.createHandleBlurInOutParam('serverHostname'),
                name: 'inserverHostname',
                autoComplete: 'on',
                required: true,
              }}
              label={
                <Trans
                  id="remote_identity.form.incomming_mail_server.label"
                  message="Incoming mail server:"
                />
              }
              errors={this.state.formErrors.inserverHostname}
            />
          </FormColumn>
          <FormColumn bottomSpace size="shrink">
            <TextFieldGroup
              inputProps={{
                value: this.state.remoteIdentity.inserverPort,
                onChange: this.handleParamsChange,
                name: 'inserverPort',
                type: 'number',
                autoComplete: 'on',
                required: true,
              }}
              label={
                <Trans id="remote_identity.form.port.label" message="Port:" />
              }
              errors={this.state.formErrors.inserverPort}
            />
          </FormColumn>
        </FormRow>
        {!this.state.advancedForm && (
          <FormRow>
            <FormColumn bottomSpace fluid>
              <TextFieldGroup
                inputProps={{
                  value: this.state.remoteIdentity.outserverHostname,
                  onChange: this.handleParamsChange,
                  name: 'outserverHostname',
                  autoComplete: 'on',
                  required: true,
                }}
                label={
                  <Trans
                    id="remote_identity.form.outgoing_mail_server.label"
                    message="Outgoing mail server:"
                  />
                }
                errors={this.state.formErrors.outserverHostname}
              />
            </FormColumn>
            <FormColumn bottomSpace size="shrink">
              <TextFieldGroup
                inputProps={{
                  value: this.state.remoteIdentity.outserverPort,
                  onChange: this.handleParamsChange,
                  name: 'outserverPort',
                  type: 'number',
                  autoComplete: 'on',
                  required: true,
                }}
                label={
                  <Trans id="remote_identity.form.port.label" message="Port:" />
                }
                errors={this.state.formErrors.outserverPort}
              />
            </FormColumn>
          </FormRow>
        )}
        <FormRow>
          <FormColumn bottomSpace size="medium">
            <TextFieldGroup
              inputProps={{
                value: this.state.remoteIdentity.inusername,
                onChange: this.handleParamsChange,
                onBlur: this.createHandleBlurInOutParam('username'),
                name: 'inusername',
                autoComplete: 'username',
                required: true,
              }}
              label={
                <Trans
                  id="remote_identity.form.username.label"
                  message="Login:"
                />
              }
              errors={this.state.formErrors.inusername}
            />
          </FormColumn>
          <FormColumn bottomSpace size="medium">
            <TextFieldGroup
              inputProps={{
                type: 'password',
                value: this.state.remoteIdentity.inpassword,
                onChange: this.handleParamsChange,
                onBlur: this.createHandleBlurInOutParam('password'),
                name: 'inpassword',
                autoComplete: 'new-password',
                required: true,
              }}
              label={
                <Trans
                  id="remote_identity.form.password.label"
                  message="Password:"
                />
              }
              errors={this.state.formErrors.inpassword}
            />
          </FormColumn>
        </FormRow>
        {this.state.advancedForm && (
          <Fragment>
            <FormRow>
              <FormColumn bottomSpace>
                <TextBlock weight="strong">
                  <Trans
                    id="remote_identity.form.outserver"
                    message="Out server"
                  />
                </TextBlock>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn bottomSpace fluid>
                <TextFieldGroup
                  inputProps={{
                    value: this.state.remoteIdentity.outserverHostname,
                    onChange: this.handleParamsChange,
                    name: 'outserverHostname',
                    autoComplete: 'on',
                    required: true,
                  }}
                  label={
                    <Trans
                      id="remote_identity.form.outgoing_mail_server.label"
                      message="Outgoing mail server:"
                    />
                  }
                  errors={this.state.formErrors.outserverHostname}
                />
              </FormColumn>
              <FormColumn bottomSpace size="shrink">
                <TextFieldGroup
                  inputProps={{
                    value: this.state.remoteIdentity.outserverPort,
                    onChange: this.handleParamsChange,
                    name: 'outserverPort',
                    type: 'number',
                    autoComplete: 'on',
                    required: true,
                  }}
                  label={
                    <Trans
                      id="remote_identity.form.port.label"
                      message="Port:"
                    />
                  }
                  errors={this.state.formErrors.outserverPort}
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn bottomSpace size="medium">
                <TextFieldGroup
                  inputProps={{
                    value: this.state.remoteIdentity.outusername,
                    onChange: this.handleParamsChange,
                    name: 'outusername',
                    autoComplete: 'username',
                    required: true,
                  }}
                  label={
                    <Trans
                      id="remote_identity.form.username.label"
                      message="Login:"
                    />
                  }
                  errors={this.state.formErrors.outusername}
                />
              </FormColumn>
              <FormColumn bottomSpace size="medium">
                <TextFieldGroup
                  inputProps={{
                    type: 'password',
                    value: this.state.remoteIdentity.outpassword,
                    onChange: this.handleParamsChange,
                    name: 'outpassword',
                    autoComplete: 'new-password',
                    required: true,
                  }}
                  label={
                    <Trans
                      id="remote_identity.form.password.label"
                      message="Password:"
                    />
                  }
                  errors={this.state.formErrors.outpassword}
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
                label={
                  <Status
                    status={
                      this.state.remoteIdentity.active ? 'active' : 'inactive'
                    }
                  />
                }
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

    return <FieldErrors errors={this.state.formErrors.global} />;
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
            title={
              <Trans
                id="remote_identity.confirm-delete.title"
                message="Delete the external account"
              />
            }
            content={
              <Trans
                id="remote_identity.confirm-delete.content"
                message="The external account will deactivated then deleted."
              />
            }
            onConfirm={this.handleDelete}
            render={(confirm) => (
              <Button
                onClick={confirm}
                shape="plain"
                color="alert"
                className="m-remote-identity-email__action"
              >
                <Trans id="remote_identity.action.delete" message="Delete" />
              </Button>
            )}
          />
        )}
        {!this.state.editing && (
          <Button
            onClick={this.handleToggleEdit}
            shape="hollow"
            className="m-remote-identity-email__action"
          >
            <Trans id="remote_identity.action.edit" message="Edit" />
          </Button>
        )}
        {this.state.editing && (
          <Fragment>
            <Button
              onClick={this.handleCancel}
              shape="hollow"
              className="m-remote-identity-email__action"
            >
              <Trans id="remote_identity.action.cancel" message="Cancel" />
            </Button>
            <Button
              onClick={this.handlToggleAdvanced}
              shape="plain"
              className="m-remote-identity-email__action"
            >
              {!this.state.advancedForm && (
                <Trans
                  id="remote_identity.action.toggle-advanced-form"
                  message="Advanced"
                />
              )}
              {this.state.advancedForm && (
                <Trans
                  id="remote_identity.action.toggle-simple-form"
                  message="Simple"
                />
              )}
            </Button>
            <Button
              onClick={this.handleSave}
              shape="plain"
              className="m-remote-identity-email__action"
              icon={
                this.state.hasActivity ? (
                  <Spinner
                    svgTitleId="save-remote-email-spinner"
                    isloading
                    display="inline"
                  />
                ) : (
                  'email'
                )
              }
              disabled={this.state.hasActivity}
            >
              <Trans id="remote_identity.action.save" message="Save" />
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
