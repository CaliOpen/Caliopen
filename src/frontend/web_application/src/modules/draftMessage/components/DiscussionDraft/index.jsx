import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export const TopRow = ({ className, ...props }) => (
  <div className={classnames('m-discussion-draft__top-row', className)} {...props} />
);

TopRow.propTypes = {
  className: PropTypes.string,
};

TopRow.defaultProps = {
  className: null,
};

export const BottomRow = ({ className, ...props }) => (
  <div className={classnames('m-discussion-draft__bottom-row', className)} {...props} />
);

BottomRow.propTypes = {
  className: PropTypes.string,
};

BottomRow.defaultProps = {
  className: null,
};

export const BodyRow = ({ className, ...props }) => (
  <div className={classnames('m-discussion-draft__body-row', className)} {...props} />
);

BodyRow.propTypes = {
  className: PropTypes.string,
};

BodyRow.defaultProps = {
  className: null,
};

const DiscussionDraft = ({ className, draftFormRef, ...props }) => (
  <div className={classnames('m-discussion-draft', className)} ref={draftFormRef} {...props} />
);

DiscussionDraft.propTypes = {
  className: PropTypes.string,
  draftFormRef: PropTypes.func,
};

DiscussionDraft.defaultProps = {
  className: null,
  draftFormRef: () => {},
};

export default DiscussionDraft;
