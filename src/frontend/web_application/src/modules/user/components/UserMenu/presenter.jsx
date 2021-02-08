import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import UserInfo from '../UserInfo';
import {
  Link,
  Button,
  Icon,
  Dropdown,
  withDropdownControl,
  VerticalMenu,
  VerticalMenuItem,
  Separator,
} from '../../../../components';
// some circular reference breaks unit tests when importing directly from the module
import { withNotification } from '../../../userNotify/hoc/withNotification';
import './style.scss';
import './next-feature-button.scss';

const DropdownControl = withDropdownControl(Button);

@withI18n()
@withNotification()
class Presenter extends Component {
  static propTypes = {
    user: PropTypes.shape({}),
    getUser: PropTypes.func.isRequired,
    notifyInfo: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    user: {},
  };

  state = {
    isDropdownOpen: false,
  };

  dropdownControlRef = createRef();

  componentDidMount() {
    this.props.getUser();
  }

  handleDropdownToggle = (isDropdownOpen) => {
    this.setState({ isDropdownOpen });
  };

  handleClickNewFeature = () => {
    const { notifyInfo, i18n } = this.props;

    notifyInfo({
      message: i18n._('next-feature.generic', null, {
        defaults:
          'This feature is not available for now but is planned to be added to Caliopen.',
      }),
    });
  };

  render() {
    const { user } = this.props;

    return (
      <div className="m-user-menu">
        <DropdownControl
          ref={this.dropdownControlRef}
          icon="user"
          display="inline-block"
        >
          <span className="m-user-menu__button-label">{user && user.name}</span>
          &nbsp;
          <Icon type={this.state.isDropdownOpen ? 'caret-up' : 'caret-down'} />
        </DropdownControl>
        <Dropdown
          dropdownControlRef={this.dropdownControlRef}
          alignRight
          isMenu
          hasTriangle
          closeOnClick="all"
          onToggle={this.handleDropdownToggle}
          displayFirstLayer
        >
          <VerticalMenu>
            <VerticalMenuItem>
              <UserInfo className="m-user-menu__user-info" />
            </VerticalMenuItem>
            <Separator />
            <VerticalMenuItem>
              <Link to="/contacts" expanded button>
                <Trans id="header.menu.contacts">Contacts</Trans>
              </Link>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Link to="/user/profile" expanded button>
                <Trans id="header.menu.account">Account</Trans>
              </Link>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Link to="/settings/application" expanded button>
                <Trans id="header.menu.settings">Settings</Trans>
              </Link>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Button
                className="m-next-feature-button"
                center={false}
                display="expanded"
                onClick={this.handleClickNewFeature}
              >
                <Trans id="header.menu.agenda">Agenda</Trans>
              </Button>
            </VerticalMenuItem>
            <VerticalMenuItem>
              <Button
                className="m-next-feature-button"
                center={false}
                display="expanded"
                onClick={this.handleClickNewFeature}
              >
                <Trans id="header.menu.files">Files</Trans>
              </Button>
            </VerticalMenuItem>
            <VerticalMenuItem>
              {user && (
                <Link href="/auth/signout" button expanded>
                  <Trans id="header.menu.signout">Signout</Trans>
                </Link>
              )}
              {!user && (
                <Link to="/auth/signin" button expanded>
                  <Trans id="header.menu.signin">Signin</Trans>
                </Link>
              )}
            </VerticalMenuItem>
          </VerticalMenu>
        </Dropdown>
      </div>
    );
  }
}

export default Presenter;
