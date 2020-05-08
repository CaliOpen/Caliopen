import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import {
  Brand,
  Link,
  Button,
  withDropdownControl,
  Dropdown,
  VerticalMenu,
  VerticalMenuItem,
  Icon,
} from '../../components';
import { BackgroundImage } from '../../modules/pi';
import { TabProvider } from '../../modules/tab';
import { PageActions } from '../../modules/control';
import { UserMenu } from '../../modules/user';
import { ScrollDetector } from '../../modules/scroll';
import InstallButton from './components/InstallButton';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import NotificationCenter from './components/NotificationCenter';
import TakeATour from './components/TakeATour';
import PageContainer from '../PageContainer';
import './style.scss';
import './header.scss';
import './navbar.scss';

const DropdownControl = withDropdownControl(Button);

// eslint-disable-next-line react/prefer-stateless-function
class Page extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  state = {
    isDropdownHelpOpen: false,
  };

  dropdownControlRef = createRef();

  handleDropdownToggle = (isDropdownHelpOpen) => {
    this.setState({ isDropdownHelpOpen });
  };

  render() {
    const { children } = this.props;

    return (
      <TabProvider>
        <BackgroundImage context="secure" className="l-page">
          {/* <div className="header-device">
            <PageContainer>
              Vous consultez actuellement vos messages dans un environement que vous avez classé
              comme <Link href="#">sûr</Link>, depuis un <Link href="#">appareil de
              confiance.</Link>
            </PageContainer>
          </div> */}
          <div className="l-header">
            <PageContainer className="l-header__container">
              <Link to="/" className="l-header__brand-link">
                <Brand className="l-header__brand" responsive />
              </Link>
              {/* <div className="l-header__notif-menu"><Button href="#"><Icon type="bell"
              /></Button></div> */}
              <div className="l-header__take-a-tour">
                <DropdownControl
                  ref={this.dropdownControlRef}
                  icon="info-circle"
                  display="inline-block"
                >
                  <span className="l-header__button-label">
                    <Trans id="header.help.menu">Help & info</Trans>
                  </span>
                  <Icon
                    type={
                      this.state.isDropdownHelpOpen ? 'caret-up' : 'caret-down'
                    }
                  />
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
                    {/* FIXME: unable to get the router outside of the App */}
                    <VerticalMenuItem>
                      <TakeATour />
                    </VerticalMenuItem>
                    <VerticalMenuItem>
                      <Link
                        button
                        expanded
                        href="https://github.com/CaliOpen/Caliopen/blob/master/CHANGELOG.md"
                        target="_blank"
                      >
                        <Trans id="header.help.last-changes">
                          Last changes
                        </Trans>
                      </Link>
                    </VerticalMenuItem>
                    <VerticalMenuItem>
                      <Link
                        button
                        expanded
                        href="https://feedback.caliopen.org/t/questions-frequemment-posees-frequently-asked-questions/162"
                        target="_blank"
                      >
                        <Trans id="header.help.faq">FAQ [fr]</Trans>
                      </Link>
                    </VerticalMenuItem>
                    <VerticalMenuItem>
                      <Link
                        button
                        expanded
                        href="https://feedback.caliopen.org"
                        target="_blank"
                      >
                        <Trans id="header.help.feedback">Feedback</Trans>
                      </Link>
                    </VerticalMenuItem>
                    <VerticalMenuItem>
                      <Link
                        button
                        expanded
                        href="/privacy-policy.html"
                        target="_blank"
                      >
                        <Trans id="header.help.privacy-policy">
                          Privacy Policy
                        </Trans>
                      </Link>
                    </VerticalMenuItem>
                    <InstallButton />
                  </VerticalMenu>
                </Dropdown>
              </div>
              <div className="l-header__user-menu">
                <UserMenu />
              </div>
            </PageContainer>
          </div>

          <PageContainer>
            <PageActions className="l-page__main-actions" />
          </PageContainer>

          <ScrollDetector
            offset={136}
            render={(isSticky) => (
              <div className="l-navbar">
                <div
                  className={classnames('l-navbar__wrapper', {
                    'l-navbar__wrapper--sticky': isSticky,
                  })}
                >
                  <PageContainer>
                    <Navigation isSticky={isSticky} />
                  </PageContainer>
                </div>
              </div>
            )}
          />

          <PageContainer>{children}</PageContainer>

          <PageContainer>
            <Footer />
          </PageContainer>
        </BackgroundImage>
        <NotificationCenter />
      </TabProvider>
    );
  }
}

export default Page;
