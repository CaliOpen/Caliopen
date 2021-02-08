import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { settingsSelector } from '../../../../store/selectors/settings';

const mapStateToProps = createSelector(
  [settingsSelector],
  ({
    contact_display_order: contactDisplayOrder,
    contact_display_format: contactDisplayFormat,
  }) => ({
    contactDisplayOrder,
    contactDisplayFormat,
  })
);

export default connect(mapStateToProps)(Presenter);
