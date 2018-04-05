import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Icon } from '../../../../components';
import { draftExcerptIndex } from '../../../../modules/a11y';
import './style.scss';

class ReplyExcerpt extends PureComponent {
  static propTypes = {
    draft: PropTypes.shape({}),
    onFocus: PropTypes.func.isRequired,
    draftExcerptRef: PropTypes.func,
    className: PropTypes.string,
  };
  static defaultProps = {
    draft: undefined,
    draftExcerptRef: () => {},
    className: undefined,
  };

  render() {
    const {
      draft, draftExcerptRef, onFocus, className,
    } = this.props;

    return (
      <div
        className={classnames('m-reply-excerpt', className)}
        ref={draftExcerptRef}
        onClick={onFocus}
        onKeyPress={onFocus}
        role="button"
        tabIndex={draftExcerptIndex}
      >
        <Icon type="pencil" spaced />
        {draft && draft.body}
      </div>
    );
  }
}

export default ReplyExcerpt;
