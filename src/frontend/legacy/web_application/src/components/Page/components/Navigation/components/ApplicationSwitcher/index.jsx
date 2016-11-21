import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import Presenter from './presenter';
import * as ApplicationManager from '../../../../../../services/application-manager/';

const applicationListSelector = () => ApplicationManager.getApplications();
const applicationSelector = state => state.application.applicationName;

const mapStateToProps = createSelector(
  [applicationSelector, applicationListSelector],
  (currentApplicationName, applications) => {
    const currentApplication = applications
      .find(application => application.name === currentApplicationName);

    return { currentApplication, applications };
  }
);

export default connect(mapStateToProps)(Presenter);
