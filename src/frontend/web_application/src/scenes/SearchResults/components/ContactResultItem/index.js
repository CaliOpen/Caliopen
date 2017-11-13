import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { settingsSelector } from '../../../../store/selectors/settings';

const mapStateToProps = createSelector(
  [settingsSelector],
  ({ contact_display_format }) => ({
    contact_display_format,
  })
);

export default connect(mapStateToProps)(Presenter);
