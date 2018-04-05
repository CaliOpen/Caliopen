import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Presenter from './presenter';

const mapDispatchToProps = dispatch => bindActionCreators({
  action: () => push('/compose'),
}, dispatch);

export default connect(null, mapDispatchToProps)(Presenter);
