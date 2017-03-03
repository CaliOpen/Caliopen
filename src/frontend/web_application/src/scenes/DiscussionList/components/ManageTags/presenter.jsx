import React, { PropTypes } from 'react';
import TagsForm from '../../../../components/TagsForm';

const ManageTags = ({ discussion, onDiscussionChange }) => {
  const handleTagsChange = ({ tags }) => {
    const updateDiscussion = {
      ...discussion,
      tags,
    };

    onDiscussionChange({ discussion: updateDiscussion, original: discussion });
  };

  return (
    <TagsForm tags={discussion.tags} onChange={handleTagsChange} />
  );
};

ManageTags.propTypes = {
  discussion: PropTypes.shape({}).isRequired,
  onDiscussionChange: PropTypes.func.isRequired,
};

export default ManageTags;
