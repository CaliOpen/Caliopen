import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveUserPublicKeyAction } from '../../../../modules/publicKey';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveUserPublicKey: saveUserPublicKeyAction,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(Presenter);
