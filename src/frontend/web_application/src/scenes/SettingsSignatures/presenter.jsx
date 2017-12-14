import React from 'react';
import PropTypes from 'prop-types';
import Section from '../../components/Section';
import PageTitle from '../../components/PageTitle';
import SignatureForm from './components/SignatureForm';
import NavList, { ItemContent } from '../../components/NavList';
import Link from '../../components/Link';

import './style.scss';

const fakeSignaturesSettings = {
  signature: 'bla',
};

const navLinks = [
  { title: 'myself@caliopen.local', to: '/settings/signatures' },
  { title: 'myothermyself@caliopen.local', to: '/settings/signatures' },
];

const SettingsSignatures = ({ __ }) => (
  <div className="s-settings-signatures">
    <PageTitle />
    {navLinks &&
      <NavList dir="vertical" className="s-settings-signatures__menu">
        {navLinks.map(link => (
          // this should be identities.map(identity => ... )
          <ItemContent active={false} large key={link.title}>
            <Link noDecoration {...link}>{link.title}</Link>
          </ItemContent>
        ))}
      </NavList>
    }
    <div className="s-settings-signatures__panel">
      <Section title={__('settings.signatures.title')}>
        <SignatureForm settings={fakeSignaturesSettings} onSubmit={str => str} />
      </Section>
    </div>
  </div>
);

SettingsSignatures.propTypes = {
  __: PropTypes.func.isRequired,
};

export default SettingsSignatures;
