import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { locationSelector } from '../../store/selectors/router';
import Presenter from './presenter';

const mapStateToProps = state => ({ location: locationSelector(state) });

const mapDispatchToProps = dispatch => bindActionCreators({
  replaceLocation: replace,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Presenter);
