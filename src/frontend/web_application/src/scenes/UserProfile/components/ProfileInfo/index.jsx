import { compose } from 'redux';
import { withI18n } from 'lingui-react';
import Presenter from './presenter';

export default compose(withI18n())(Presenter);
