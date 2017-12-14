import { compose } from 'redux';
import { withTranslator } from '@gandi/react-translate';
import { withUser } from '../../hoc/user';
import Presenter from './presenter';

export default compose(
  withUser(),
  withTranslator()
)(Presenter);
