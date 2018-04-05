import { compose } from 'redux';
import { withUser } from '../../../../hoc/user';
import Presenter from './presenter';

export default compose(withUser())(Presenter);
