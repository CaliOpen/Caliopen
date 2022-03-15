import * as React from 'react';
import classnames from 'classnames';
import { Trans } from '@lingui/react';
import { Brand, Button, Link, Section } from '../../components';
import { SigninForm, SignupForm } from '../../modules/user';
import StylezedScreenshot from './components/StylezedScreenshot';
import './style.scss';

function About(): JSX.Element {
  const [createFormOpen, setCreateFormOpen] = React.useState(false);

  const handleToggleCreate = () => {
    setCreateFormOpen((prev) => !prev);
  };

  return (
    <div className="s-about">
      <div className="s-about__info">
        <div className="s-about__section-content">
          <h1 className="s-about__title">
            <Trans id="about.page-title" message="Welcome on Caliopen" />
          </h1>
          <Section className="s-about__pupose" hasSeparator>
            <Trans
              id="about.purpose"
              message="Caliopen is a private correspondence aggregator (you receive all your emails and private Twitter messages in the same place) that displays a level of confidentiality associated with all your messages."
            />
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
              <Trans
                id="about.identity"
                message="Caliopen is a non-profit organization."
              />
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
              <Trans
                id="about.purpose-signup.title"
                message="You still have no account on the Beta*?"
              />
            </h2>
            <p>
              <Trans
                id="about.purpose-signup.descr"
                message="By signup today it will be first step to secure your conversations and have all your communications in the same place, it's easy and free."
              />
            </p>
            <Button onClick={handleToggleCreate} shape="plain">
              <Trans id="about.action.toggle-create" message="Create" />
            </Button>
          </Section>
          <div
            className={classnames('s-about__signup-form', {
              's-about__signup-form--opened': createFormOpen,
            })}
          >
            <SignupForm />
            <p className="s-about__signup-beta-descr">
              <Trans
                id="about.purpose-signup.beta-descr"
                message="* Caliopen is currently in beta version, we need your help to make the best messaging and secured system."
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
