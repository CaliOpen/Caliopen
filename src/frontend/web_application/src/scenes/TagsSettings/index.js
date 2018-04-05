import { compose } from 'redux';
import { withTagActions } from '../../modules/tags';
import Presenter from './presenter';

export default compose(withTagActions())(Presenter);
