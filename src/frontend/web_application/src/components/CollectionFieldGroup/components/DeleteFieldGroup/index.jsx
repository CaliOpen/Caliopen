import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from '../../../Icon';
import Button from '../../../Button';
import './style.scss';

const DeleteFieldGroup = ({
  template,
  item,
  position,
  onDelete,
  onChange,
  className,
}) => {
  const handleDelete = () => {
    onDelete({ item });
  };

  const handleChange = ({ item: updated }) => {
    onChange({ item: updated, position });
  };

  return (
    <div className={classnames('m-delete-field-group', className)}>
      {template({
        item,
        onChange: handleChange,
        className: 'm-delete-field-group__input',
      })}
      <Button
        onClick={handleDelete}
        shape="plain"
        className="m-delete-field-group__button"
      >
        <Icon type="remove" />
      </Button>
    </div>
  );
};

DeleteFieldGroup.propTypes = {
  template: PropTypes.func.isRequired,
  item: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]).isRequired,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
DeleteFieldGroup.defaultProps = {
  className: null,
};

export default DeleteFieldGroup;
