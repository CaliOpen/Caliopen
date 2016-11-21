import React, { PropTypes } from 'react';
import classnames from 'classnames';
import Link from '../../../Link';
import Icon from '../../../Icon';
import VerticalMenu, { VerticalMenuItem } from '../../../VerticalMenu';
import './style.scss';

const NavigationAlt = ({ user, currentApplication, applications }) => (
  <div className="l-nav-alt">
    <div className="l-nav-alt__user">
      <div className="l-nav-alt__avatar">
        <avatar-letter contact={user.contact} modifiers={{ size: 'small' }} />
      </div>
      <div className="l-nav-alt__user-name">
        <div>{user.contact.title}</div>
        {
          // FIXME: use contact address https://github.com/CaliOpen/Caliopen/issues/26
          <div>{user.name}</div>
        }
      </div>
    </div>
    <VerticalMenu className="l-nav-alt__menu">
      {
        applications.map((application, key) => (
          <VerticalMenuItem key={key}>
            <Link
              to={application.route}
              modifiers={{ button: true, expanded: true }}
              className={classnames({ 'is-active': currentApplication === application })}
            >
              <Icon type={application.icon} /> {`header.menu.${application.name}`}
            </Link>
          </VerticalMenuItem>
        ))
      }
    </VerticalMenu>
    <tab-list-alt />
    <VerticalMenu className="l-nav-alt__menu">
      <VerticalMenuItem>
        <Link to="/auth/logout" modifiers={{ button: true, expanded: true }}>
          {'header.menu.signout'}
        </Link>
      </VerticalMenuItem>
    </VerticalMenu>
  </div>
);

NavigationAlt.propTypes = {
  user: PropTypes.shape({}).isRequired,
  applications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  currentApplication: PropTypes.shape({}).isRequired,
};

export default NavigationAlt;
