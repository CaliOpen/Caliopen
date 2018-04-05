import { compose } from 'redux';
import Presenter from './presenter';
import { withNotification } from '../../../../../../hoc/notification';

export default compose(withNotification())(Presenter);
