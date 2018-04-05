import { withI18n } from 'lingui-react';
import { compose } from 'redux';
import Presenter from './presenter';

export default compose(withI18n())(Presenter);
