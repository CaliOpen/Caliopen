import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import Tour from './components/Tour';
import { Button } from '../../../../components';
import './style.scss';

class TakeATour extends Component {
  static propTypes = {
    i18n: PropTypes.shape({
      _: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {};

  state = {
    isTourActive: false,
  };

  handleToggleTour = () => {
    this.setState((prevState) => ({ isTourActive: !prevState.isTourActive }));
  };

  handleChangeStep = (step) => {
    this.setState({ tourStep: step });
  };

  handleclose = () => {
    this.setState({ isTourActive: false });
  };

  render() {
    const { i18n } = this.props;

    const steps = [
      {
        selector: '.s-timeline',
        content: (
          <div>
            <h2>
              <Trans id="take-a-tour.step.intro.title">Welcome!</Trans>
            </h2>
            <div>
              <Trans
                id="take-a-tour.step.intro.content"
                defaults={`
                  <0>
                    With using Caliopen, you can access to all of your private
                    messages (Email, and more to come) through a single login.
                  </0>
                  <1>
                    Now, take a look at our main features, such as unified message
                    management, intuitive search and more!
                  </1>
                  <2>
                    The first time, the timeline might look a bit empty, you can
                    easily <3>add a provider</3>.
                  </2>
                `}
                components={[
                  <p />,
                  <p />,
                  <p />,
                  // FIXME: Link cannot work outside a Router
                  <span />,
                  // <Link to="/user/identities" />,
                ]}
              />
            </div>
          </div>
        ),
        position: 'center',
      },
      {
        selector: '.m-page-actions__search-field',
        content: (
          <div>
            <h2>
              <Trans id="take-a-tour.step.search.title">Intuitive search</Trans>
            </h2>
            <div>
              <Trans
                id="take-a-tour.step.search.content"
                defaults={`
                <0>
                  Every search can include filters. All of the unencrypted data
                  can be searched.
                </0>
                <1>
                  Here you can search everything in your messages and contacts.
                </1>
              `}
                components={[<p />, <p />]}
              />
            </div>
          </div>
        ),
      },
      {
        selector: '.m-user-menu',
        content: (
          <div>
            <h2>
              <Trans id="take-a-tour.step.user-menu.title">Account menu</Trans>
            </h2>
            <div>
              <Trans
                id="take-a-tour.step.user-menu.content"
                defaults={`
                <0>
                  Keep up-to-date your account information and manage your
                  settings from here!
                </0>
                <1>Customize your application in your settings.</1>
                <2>And connect providers like Gmail or Twitter.</2>
              `}
                components={[<p />, <p />, <p />]}
              />
            </div>
          </div>
        ),
        position: 'bottom',
      },
      {
        selector: '.m-page-actions__action-btns',
        content: (
          <div>
            <h2>
              <Trans id="take-a-tour.step.call-to-action.title">
                Create quickly
              </Trans>
            </h2>
            <div>
              <p>
                <Trans id="take-a-tour.step.call-to-action.content">
                  Create a new message on the fly.
                </Trans>
              </p>
            </div>
          </div>
        ),
      },
      {
        selector: '.l-header__take-a-tour',
        content: (
          <div>
            <h2>
              <Trans id="take-a-tour.step.install.title">Installation</Trans>
            </h2>
            <div>
              <Trans
                id="take-a-tour.step.install.content"
                defaults={`
                <0>If available, the installation button will be displayed.</0>
                <1>
                  On android and ios it will add Caliopen to your homescreen. On
                  desktop, this feature is available for chrome and chromium.
                </1>
                <2>
                  This technology is called «Progressive Web App», it will make
                  the app faster to load and some features will be available
                  offline and it will help to interract with your device (like
                  the notification feature) if your are agree.
                </2>
              `}
                components={[<p />, <p />, <p />]}
              />
            </div>
          </div>
        ),
        position: 'center',
      },
    ];

    return (
      <Button
        onClick={this.handleToggleTour}
        icon="question-circle"
        display="expanded"
        className="m-take-a-tour"
      >
        <Trans id="take-a-tour.action.toggle">Take a tour</Trans>
        <Tour
          isOpen={this.state.isTourActive}
          step={this.state.tourStep}
          onRequestClose={this.handleclose}
          steps={steps}
          badgeContent={(current, total) => (
            <Trans
              id="take-a-tour.current-step"
              defaults="Take a tour ({current} of {total})"
              values={{ current, total }}
            />
          )}
          showNavigation={false}
          skipButton={i18n._('take-a-tour.action.skip', null, {
            defaults: 'Skip',
          })}
          prevButton={i18n._('take-a-tour.action.prev', null, {
            defaults: 'Previous',
          })}
          nextButton={i18n._('take-a-tour.action.next', null, {
            defaults: 'Next',
          })}
          lastStepNextButton={i18n._('take-a-tour.action.last-step', null, {
            defaults: 'Finish',
          })}
          closeButton={i18n._('take-a-tour.action.close', null, {
            defaults: 'Close',
          })}
        />
      </Button>
    );
  }
}

export default TakeATour;
