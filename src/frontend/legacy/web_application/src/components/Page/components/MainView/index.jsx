import { PropTypes } from 'react';
import mainView from './presenter';

const MainViewContainer = ({ header, nav, callToAction, notification, children }) =>
  mainView(header, nav, callToAction, notification, children);

MainViewContainer.propTypes = {
  header: PropTypes.element.isRequired,
  nav: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
  callToAction: PropTypes.element.isRequired,
  notification: PropTypes.element.isRequired,
};

export default MainViewContainer;
