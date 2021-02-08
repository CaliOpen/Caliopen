import { compose } from 'redux';
import { withI18n } from '@lingui/react';
import { withNotification } from '../../../userNotify';
import Presenter from './presenter';

export default compose(withI18n(), withNotification())(Presenter);
