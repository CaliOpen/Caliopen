import React from 'react';
import PropTypes from 'prop-types';
import { Section, Link, PageTitle, NavList, NavItem } from '../../components';
import SignatureForm from './components/SignatureForm';

import './style.scss';

const fakeSignaturesSettings = {
  signature: 'bla',
};

const navLinks = [
  { title: 'myself@caliopen.local', to: '/settings/signatures' },
  { title: 'myothermyself@caliopen.local', to: '/settings/signatures' },
];

const SettingsSignatures = ({ i18n }) => (
  <div className="s-settings-signatures">
    <PageTitle />
    {navLinks && (
      <NavList dir="vertical" className="s-settings-signatures__menu">
        {navLinks.map((link) => (
          // this should be identities.map(identity => ... )
          <NavItem active={false} large key={link.title}>
            <Link noDecoration {...link}>
              {link.title}
            </Link>
          </NavItem>
        ))}
      </NavList>
    )}
    <div className="s-settings-signatures__panel">
      <Section
        title={i18n._('settings.signatures.title', {
          defaults: 'Update your signature',
        })}
      >
        <SignatureForm
          settings={fakeSignaturesSettings}
          onSubmit={(str) => str}
        />
      </Section>
    </div>
  </div>
);

SettingsSignatures.propTypes = {
  i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
};

export default SettingsSignatures;
