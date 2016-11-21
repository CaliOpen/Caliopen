import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import './style.scss';

class Presenter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocus: false,
    };
  }

  render() {
    const { availableActions, principalAction } = this.props;

    return (
      <div className="l-call-to-action">
        <div className={classnames('m-call-to-action', { 'm-call-to-action--focus': this.state.isFocus })}>
          {
            availableActions.map((action, idx) => action.children({
              className: classnames('m-call-to-action__btn', { 'm-call-to-action__btn--disabled': !!action.disabled }),
              key: idx,
            }))
          }
          {
            principalAction.children({
              className: classnames('m-call-to-action__btn', 'm-call-to-action__btn--principal', { 'm-call-to-action__btn--disabled': !!principalAction.disabled }),
            })
          }
        </div>
      </div>
    );
  }
}

Presenter.propTypes = {
  availableActions: PropTypes.arrayOf(PropTypes.shape({})),
  principalAction: PropTypes.shape({}),
};

export default Presenter;
