import { compose } from 'redux';
import { withTranslator } from '@gandi/react-translate';
import Presenter from './presenter';

export default compose(
  withTranslator()
)(Presenter);
