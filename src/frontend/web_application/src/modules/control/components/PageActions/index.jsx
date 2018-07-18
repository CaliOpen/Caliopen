import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Button, Icon, InputText } from '../../../../components';
import './style.scss';

class PageActions extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };
  static defaultProps = {
    className: undefined,
  };

  render() {
    const { className } = this.props;

    return (
      <div className={classnames(className, 'm-page-actions')}>
        <Button shape="plain" className="m-page-actions__write-btn"><Icon type="pencil" /> Écrire</Button>
        <div className="m-page-actions__search-field">
          <div className="m-search-field">
            <InputText className="m-search-field__search-input" />
            <Button className="m-search-field__search-button" shape="plain">
              Lancer la recherche <Icon type="search" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default PageActions;
