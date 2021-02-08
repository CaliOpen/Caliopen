import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import Presenter from './presenter';

const i18nSelector = (state) => state.i18n;
const mapStateToProps = createSelector([i18nSelector], (i18n) => ({
  locale: i18n.locale,
}));

export default connect(mapStateToProps)(Presenter);
