import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { Brand, Button, Link, Section } from '../../components';
import { SigninForm, SignupForm } from '../../modules/user';
import StylezedScreenshot from './components/StylezedScreenshot';
import './style.scss';

class About extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  static defaultProps = {
    children: null,
    className: undefined,
  };

  state = {
    createFormOpen: false,
  };

  handleToggleCreate = () =>
    this.setState((prevState) => ({
      createFormOpen: !prevState.createFormOpen,
    }));

  render() {
    const { className } = this.props;

    return (
      <div className={classnames('s-about', className)}>
        <div className="s-about__info">
          <div className="s-about__section-content">
            <h1 className="s-about__title">
              <Trans id="about.page-title">Welcome on Caliopen</Trans>
            </h1>
            <Section className="s-about__pupose" hasSeparator>
              <Trans id="about.purpose">
                Caliopen is a private correspondence aggregator (you receive all
                your emails and private Twitter messages in the same place) that
                displays a level of confidentiality associated with all your
                messages.
              </Trans>
            </Section>
            <div className="s-about__screenshot">
              <StylezedScreenshot
                type="desktop"
                className="s-about__screenshot-desktop"
              />
              <StylezedScreenshot
                type="smartphone"
                className="s-about__screenshot-smartphone"
              />
            </div>
            <div className="s-about__brand">
              <Link to="/">
                <Brand className="s-about__brand-logo" />
              </Link>
              <br />
              <em>Be good.</em>
              <p>
                <Trans id="about.identity">
                  Caliopen is a non-profit organization.
                </Trans>
              </p>
            </div>
          </div>
        </div>
        <div className="s-about__interactions">
          <div className="s-about__section-content">
            <Section className="s-about__signin-form" hasSeparator>
              <SigninForm />
            </Section>
            <Section className="s-about__purpose-signup" hasSeparator>
              <h2>
                <Trans id="about.purpose-signup.title">
                  You still have no account on the Beta*?
                </Trans>
              </h2>
              <p>
                <Trans id="about.purpose-signup.descr">
                  By signup today it will be first step to secure your
                  conversations and have all your communications in the same
                  place, it&apos;s easy and free.
                </Trans>{' '}
                <Button onClick={this.handleToggleCreate} shape="plain">
                  <Trans id="about.action.toggle-create">Create</Trans>
                </Button>
              </p>
            </Section>
            <div
              className={classnames('s-about__signup-form', {
                's-about__signup-form--opened': this.state.createFormOpen,
              })}
            >
              <SignupForm />
              <p className="s-about__signup-beta-descr">
                <Trans id="about.purpose-signup.beta-descr">
                  * Caliopen is currently in beta version, we need your help to
                  make the best messaging and secured system.
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default About;
