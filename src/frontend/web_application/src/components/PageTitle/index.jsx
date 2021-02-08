import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { userSelector } from '../../modules/user';
import { getConfig } from '../../services/config';

import Presenter from './presenter';

const { hostname } = getConfig();
const mapStateToProps = createSelector([userSelector], (user) => ({
  user,
  hostname,
}));

export default connect(mapStateToProps)(Presenter);
