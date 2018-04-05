import { compose } from 'redux';
import { connect } from 'react-redux';
import { hashSelector } from '../../store/selectors/router';
import Presenter from './presenter';

const mapStateToProps = state => ({ hash: hashSelector(state) });

export default compose(connect(mapStateToProps))(Presenter);
