import React from 'react';
import { storiesOf, action, linkTo, addDecorator } from '@kadira/storybook'; // eslint-disable-line
import { withKnobs, text, select, boolean, array, object, number } from '@kadira/storybook-addon-knobs';
import { host } from 'storybook-host';
import backgrounds from 'react-storybook-addon-backgrounds';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Badge from '../src/components/Badge';
import BlockList from '../src/components/BlockList';
import BlockListPresenter from './components/BlockList';
import Brand from '../src/components/Brand';
import Button from '../src/components/Button';
import {
  CheckboxFieldGroup,
  CollectionFieldGroup,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
  PasswordStrength,
  RadioFieldGroup,
  SelectFieldGroup,
  TextFieldGroup,
} from '../src/components/form';
import FormGridPresenter from './components/FormGrid';
import PasswordStrengthPresenter from './components/PasswordStrength';
import CollectionFieldGroupPresenter from './components/CollectionFieldGroup';
import ContactAvatarLetter, { SIZE_SMALL, SIZE_MEDIUM, SIZE_LARGE, SIZE_XLARGE } from '../src/components/ContactAvatarLetter';
import ContactBook from './layouts/ContactBook';
import ContactDetails from './components/ContactDetails';
import DefList from '../src/components/DefList';
import Devices from './layouts/Devices';
import Dropdown, { withDropdownControl } from '../src/components/Dropdown';
import DropdownMenu from '../src/components/DropdownMenu';
import Icon, { typeAssoc } from '../src/components/Icon';
import IconLetter from '../src/components/IconLetter';
import ImportContactForm from '../src/components/ImportContactForm/presenter.jsx';
import Link from '../src/components/Link';
import MessageList from './components/MessageList';
import Modal from '../src/components/Modal';
import MultidimensionalPi from '../src/components/MultidimensionalPi';
import PiBar from '../src/components/PiBar';
import Reply from './components/Reply';
import Section from '../src/components/Section';
import SigninPage from './layouts/SigninPage';
import SignupPage from './layouts/SignupPage';
import Spinner from '../src/components/Spinner';
import Subtitle from '../src/components/Subtitle';
import TagsFormPresenter from './components/TagsForm';
import TextList, { ItemContent } from '../src/components/TextList';
import Title from '../src/components/Title';
import Welcome from './Welcome';
import Changelog from './Changelog';
import Guideline from './Guideline';
import TabList from '../src/layouts/Page/components/Navigation/components/TabList/presenter';
import '../src/styles/vendor/bootstrap_foundation-sites.scss';

addDecorator(withKnobs);
addDecorator(backgrounds([
  { name: '$co-color__fg__back', value: '#333' },
  { name: '$co-color__bg__back', value: '#1d1d1d', default: true },
  { name: '$co-color__contrast__back', value: '#fff' },
]));

const hostDecorator = host({
  mobXDevTools: false,
  background: 'transparent',
  backdrop: 'transparent',
  width: '100%',
  height: '100%',
  border: false,
});

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome />
  ))
  .add('Changelog', () => (
    <Changelog />
  ));

storiesOf('Guideline', module)
  .add('Guideline', () => (
    <Guideline />
  ));

storiesOf('Auth', module)
  .add('SignupPage', () => (
    <SignupPage />
  ))
  .add('SigninPage', () => (
    <SigninPage />
  ));

storiesOf('Badge', module)
  .addDecorator(hostDecorator)
  .addWithInfo(
    'Badge',
    () => {
      const props = {
        low: boolean('low', false),
        large: boolean('large', false),
        children: text('children', '142'),
      };

      return <Badge {...props} />;
    },
  );

storiesOf('Buttons & Links', module)
  .addDecorator(hostDecorator)
  .addWithInfo('Button', () => {
    const iconType = Object.assign({ '': '' }, typeAssoc);
    const props = {
      icon: select('icon', iconType, ''),
      children: text('children', 'Click Me'),
      shape: select('shape', { '': '', plain: 'plain', hollow: 'hollow' }, ''),
      display: select('display', { '': '', expanded: 'expanded', inline: 'inline' }, ''),
      color: select('color', { '': '', active: 'active', alert: 'alert', success: 'success', secondary: 'secondary' }, ''),
    };

    return (<Button {...props} onClick={action('clicked')} />);
  })
  .addWithInfo('Link', () => {
    const props = {
      noDecoration: boolean('noDecoration', false),
      button: boolean('button', false),
      expanded: boolean('expanded', false),
      active: boolean('active', false),
    };

    return (<Link {...props}>{text('Link children', 'Click Me')}</Link>);
  });

storiesOf('Contact', module)
  .add('ContactDetails', () => (
    <ContactDetails />
  ))
  .add('ImportContactForm', () => (
    <Modal contentLabel="" isOpen><ImportContactForm __={str => str} onSubmit={str => str} /></Modal>
  ))
  .add('ContactBook', () => (
    <ContactBook />
  ));

const DropdownControl = withDropdownControl(Button);
storiesOf('Dropdown', module)
  .addDecorator(hostDecorator)
  .addWithInfo('Dropdown', () => {
    const dropdownProps = {
      position: select('position', { '': '', bottom: 'bottom' }, ''),
      closeOnClick: boolean('closeOnClick', false),
    };

    return (
      <div>
        <DropdownControl
          toggle="story-dropdown"
          className="float-right"
        >{text('control children', 'Click me')}</DropdownControl>
        <Dropdown
          id="story-dropdown"
          {...dropdownProps}
        >{text('dropdown children', 'Hey hey I am a dropdown')}</Dropdown>
      </div>
    );
  }, { propTables: [DropdownControl, Dropdown] })
  .addWithInfo('DropdownMenu', () => {
    const dropdownProps = {
      position: select('position', { '': '', bottom: 'bottom' }, ''),
      closeOnClick: boolean('closeOnClick', false),
    };

    return (
      <div>
        <DropdownControl toggle="story-dropdown-menu" className="float-right">
          {text('control children', 'Click me')}
        </DropdownControl>
        <DropdownMenu
          id="story-dropdown-menu"
          {...dropdownProps}
        >{text('dropdown children', 'Hey hey I am a dropdown')}</DropdownMenu>
      </div>
    );
  }, { propTables: [DropdownControl, DropdownMenu] });

storiesOf('Form', module)
  .addDecorator(hostDecorator)
  .addWithInfo('Fieldset', () => (
    <Fieldset>
      <Legend>{text('Legend label', 'Foobar')}</Legend>
      {text('fieldset children', 'I\'m the content of the fieldset')}
    </Fieldset>
  ))
  .addWithInfo('FormGrid', () => (
    <FormGridPresenter />
  ), { source: false, propTables: [FormGrid, FormRow, FormColumn] })
  .addWithInfo('TextFieldGroup', () => {
    const props = {
      label: text('label', 'Foobar'),
      placeholder: text('placeholder', 'Foobar'),
      showLabelforSr: boolean('showLabelforSr', false),
      errors: array('errors', []),
    };

    return (
      <TextFieldGroup
        name="my-text"
        onChange={action('onChange')}
        {...props}
      />
    );
  })
  .addWithInfo('PasswordStrength', () => (
    <PasswordStrengthPresenter />
  ), { propTables: [PasswordStrength] })
  .addWithInfo('SelectFieldGroup', () => {
    const props = {
      label: text('label', 'Foobar'),
      showLabelforSr: boolean('showLabelforSr', false),
      options: object('options', [{ value: '', label: '' }, { value: 'foo', label: 'Foo' }, { value: 'bar', label: 'Bar' }]),
      errors: array('errors', []),
    };

    return (
      <SelectFieldGroup
        name="my-select"
        {...props}
      />
    );
  })
  .addWithInfo('RadioFieldGroup', () => {
    const props = {
      label: text('label', 'Foobar'),
      options: object('options', [{ value: 'foo', label: 'Foo' }, { value: 'bar', label: 'Bar' }]),
      errors: array('errors', []),
    };

    return (
      <RadioFieldGroup
        name="my-radio"
        {...props}
      />
    );
  })
  .addWithInfo('CheckboxFieldGroup', () => {
    const props = {
      label: text('label', 'FooBar'),
      displaySwitch: boolean('displaySwitch', false),
      showTextLabel: boolean('showTextLabel (switch only)', false),
    };

    return (
      <CheckboxFieldGroup {...props} />
    );
  })
  .addWithInfo('CollectionFieldGroup', () => (
    <CollectionFieldGroupPresenter />
  ), { propTables: [CollectionFieldGroup] });

storiesOf('Logo, Icons & Avatars', module)
  .addDecorator(hostDecorator)
  .addWithInfo('Brand', () => {
    const props = {
      theme: select('theme', { '': '', low: 'low', high: 'high' }, ''),
    };

    return (
      <Brand {...props} />
    );
  })
  .addWithInfo('ContactAvatarLetter', () => {
    const sizes = [SIZE_SMALL, SIZE_MEDIUM, SIZE_LARGE, SIZE_XLARGE]
      .reduce((acc, size) => ({ ...acc, [size]: size }), { '': '' });
    const props = {
      contact: object('contact', { title: 'Foobar' }),
      size: select('size', sizes, ''),
    };

    return (<ContactAvatarLetter {...props} />);
  })
  .addWithInfo('Icon', () => {
    const props = {
      type: select('type', typeAssoc),
      spaced: boolean('spaced', true),
    };

    return (<Icon {...props} />);
  })
  .addWithInfo('IconLetter', () => {
    const props = {
      word: text('word', 'Foo'),
    };

    return (<IconLetter {...props} />);
  })
  .addWithInfo('Spinner', () => {
    const props = {
      isLoading: boolean('isLoading', true),
    };

    return (<Spinner {...props} />);
  });

storiesOf('Layout', module)
  .addDecorator(hostDecorator)
  .addWithInfo('Section', () => {
    const props = {
      title: text('title', 'Title'),
      descr: text('descr', 'Description'),
      hasSeparator: boolean('hasSeparator', false),
    };

    return (<Section {...props}>{text('section children', 'Foobar')}</Section>);
  })
  .addWithInfo('Modal', () => {
    const props = {
      isOpen: boolean('isOpen', true),
      onAfterOpen: action('onAfterOpen'),
      onRequestClose: action('onRequestClose'),
      closeTimeoutMS: number('closeTimeoutMS', 0),
      contentLabel: text('contentLabel', ''),
    };

    return (
      <Modal title={text('title', 'modal.title')} {...props}>
        <p>{text('modal text', 'Quibus occurrere bene pertinax miles explicatis ordinibus parans hastisque feriens scuta qui habitus iram pugnantium concitat et dolorem proximos iam gestu terrebat sed eum in certamen alacriter consurgentem revocavere ductores rati intempestivum anceps subire certamen cum haut longe muri distarent, quorum tutela securitas poterat in solido locari cunctorum.')}</p>
      </Modal>
    );
  })
  .addWithInfo('NavBar - TabList', () => {
    const props = {
      application: select('current application', { discussion: 'discussion', contact: 'contact' }, 'discussion'),
      tabs: object('tabs', [{ pathname: '/foo' }, { pathname: '/bar' }]),
      requestTabs: action('requestTabs'),
      removeTab: action('removeTab'),
    };

    return (
      <Provider store={{ subscribe: () => {}, getState: () => ({ router: { location: { pathname: '/' } } }) }}><StaticRouter context={{}}><TabList {...props} /></StaticRouter></Provider>
    );
  });

storiesOf('Lists', module)
  .addDecorator(hostDecorator)
  .addWithInfo('BlockList', () => (
    <BlockListPresenter />
  ), { propTables: [BlockList] })
  .addWithInfo('TextList & ItemContent', () => (
    <TextList>
      {[
        'Standard string',
        <ItemContent>Foo, Simple ItemContent</ItemContent>,
        <ItemContent>Bar, Simple ItemContent</ItemContent>,
        <ItemContent large>Foo, Large ItemContent</ItemContent>,
        <ItemContent large>Bar, Large ItemContent</ItemContent>,
      ]}
    </TextList>
  ))
  .addWithInfo('DefList', () => (
    <DefList
      definitions={object('definitions', [
        { title: 'Bar', descriptions: ['Bar description'] },
        { title: 'Foo', descriptions: ['Foo description'] },
      ])}
    />
  ));

storiesOf('Pi', module)
  .addDecorator(hostDecorator)
  .addWithInfo('PiBar', () => {
    const props = {
      level: number('level', 50),
    };

    return (<PiBar {...props} />);
  })
  .addWithInfo('MultidimensionalPi', () => {
    const props = {
      pi: object('PIs', [
        { name: 'behavioral', level: 20 },
        { name: 'contextual', level: 95 },
        { name: 'technical', level: 55 },
      ]),
      displayAveragePi: boolean('display Average PI', false),
      mini: boolean('mini', false),
    };

    return (<MultidimensionalPi {...props} />);
  });

storiesOf('Settings', module)
  .add('Devices', () => (
    <Devices />
  ));

storiesOf('Tags', module)
  .addDecorator(hostDecorator)
  .add('TagsForm', () => (
    <TagsFormPresenter />
  ));

storiesOf('Titles', module)
  .addDecorator(hostDecorator)
  .addWithInfo('Title', () => {
    const props = {
      hr: boolean('hr', false),
      actions: (<span className="pull-right">{text('actions', 'Foo')}</span>),
    };

    return (<Title {...props}>{text('Title children', 'Hello world')}</Title>);
  })
  .addWithInfo('Subtitle', () => {
    const props = {
      hr: boolean('hr', false),
      actions: (<span className="pull-right">{text('actions', 'Foo')}</span>),
    };

    return (<Subtitle {...props}>{text('Title children', 'Hello world')}</Subtitle>);
  });

storiesOf('Compose & Reply', module)
  .add('Reply', () => (
    <Reply />
  ));

storiesOf('Discussions & Messages', module)
  .add('MessageList', () => (
    <MessageList />
  ));
