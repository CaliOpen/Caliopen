import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook'; // eslint-disable-line
import Badge from './components/Badge';
import BlockList from './components/BlockList';
import Brand from './components/Brand';
import Button from './components/Button';
import CheckboxFieldGroup from './components/CheckboxFieldGroup';
import CollectionFieldGroup from './components/CollectionFieldGroup';
import ContactAvatarLetter from './components/ContactAvatarLetter';
import ContactBook from './layouts/ContactBook';
import ContactDetails from './components/ContactDetails';
import DefList from './components/DefList';
// import Devices from './layouts/Devices';
import Dropdown from './components/Dropdown';
import Fieldset from './components/Fieldset';
import FormGrid from './components/FormGrid';
import Icon from './components/Icon';
import Link from './components/Link';
import Modal from './components/Modal';
import PiBar from './components/PiBar';
import PasswordStrength from './components/PasswordStrength';
import RadioFieldGroup from './components/RadioFieldGroup';
import Section from './components/Section';
import SelectFieldGroup from './components/SelectFieldGroup';
import SigninPage from './layouts/SigninPage';
import SignupPage from './layouts/SignupPage';
import Spinner from './components/Spinner';
import Subtitle from './components/Subtitle';
import TagsForm from './components/TagsForm';
import TextFieldGroup from './components/TextFieldGroup';
import TextList from './components/TextList';
import Title from './components/Title';
import Welcome from './Welcome';
import Changelog from './Changelog';
import '../src/styles/vendor/bootstrap_foundation-sites.scss';

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome />
  ))
  .add('Changelog', () => (
    <Changelog />
  ));

storiesOf('Auth', module)
  .add('SignupPage', () => (
    <SignupPage />
  ))
  .add('SigninPage', () => (
    <SigninPage />
  ));

storiesOf('Badge', module)
  .add('Badge', () => (
    <Badge />
  ));

storiesOf('Buttons & Links', module)
  .add('Buttons', () => (
    <Button />
  ))
  .add('Links', () => (
    <Link />
  ));

storiesOf('Contact', module)
  .add('ContactDetails', () => (
    <ContactDetails />
  ))
  .add('ContactBook', () => (
    <ContactBook />
  ));
storiesOf('Dropdown', module)
  .add('Dropdown', () => (
    <Dropdown />
  ));

storiesOf('Form', module)
  .add('Fieldset', () => (
    <Fieldset />
  ))
  .add('FormGrid', () => (
    <FormGrid />
  ))
  .add('TextFieldGroup', () => (
    <TextFieldGroup />
  ))
  .add('PasswordStrength', () => (
    <PasswordStrength />
  ))
  .add('SelectFieldGroup', () => (
    <SelectFieldGroup />
  ))
  .add('RadioFieldGroup', () => (
    <RadioFieldGroup />
  ))
  .add('CheckboxFieldGroup', () => (
    <CheckboxFieldGroup />
  ))
  .add('CollectionFieldGroup', () => (
    <CollectionFieldGroup />
  ));

storiesOf('Icons & Avatars', module)
.add('Brand', () => (
  <Brand />
))
  .add('ContactAvatarLetter', () => (
    <ContactAvatarLetter />
  ))
  .add('Icon', () => (
    <Icon />
  ))
  .add('Spinner', () => (
    <Spinner />
  ));

storiesOf('Layout', module)
  .add('Section', () => (
    <Section />
  ))
  .add('Modal', () => (
    <Modal />
  ));
storiesOf('Lists', module)
  .add('BlockList', () => (
    <BlockList />
  ))
  .add('TextList & ItemContent', () => (
    <TextList />
  ))
  .add('DefList', () => (
    <DefList />
  ));

storiesOf('Pi', module)
  .add('PiBar', () => (
    <PiBar />
  ));

// XXX: unable to simply add Devices and Settings due to HOC & translator
// storiesOf('Settings', module)
//   .add('Devices', () => (
//     <Devices />
//   ));

storiesOf('Tags', module)
  .add('TagsForm', () => (
    <TagsForm />
  ));

storiesOf('Titles', module)
  .add('Title', () => (
    <Title />
  ))
  .add('Subtitle', () => (
    <Subtitle />
  ));
