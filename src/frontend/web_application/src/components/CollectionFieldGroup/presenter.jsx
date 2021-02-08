import React from 'react';
import PropTypes from 'prop-types';
import DeleteFieldGroup from './components/DeleteFieldGroup';
import AddFieldGroup from './components/AddFieldGroup';
import './style.scss';

const CollectionFieldGroup = ({
  collection,
  defaultValue,
  addTemplate,
  editTemplate,
  onChange,
}) => {
  const handleAdd = ({ item }) => {
    onChange([item, ...collection]);
  };

  const handleChangeItem = ({ item, position }) => {
    const newCollection = [...collection];
    newCollection[position] = item;

    onChange(newCollection);
  };

  const handleDelete = ({ item: deletedItem }) => {
    onChange(collection.filter((item) => item !== deletedItem));
  };

  return (
    <div className="m-collection-field-group">
      <AddFieldGroup
        template={addTemplate}
        defaultValue={defaultValue}
        onAdd={handleAdd}
      />
      {collection.map((item, key) => (
        <DeleteFieldGroup
          key={key}
          position={key}
          item={item}
          template={editTemplate}
          onChange={handleChangeItem}
          onDelete={handleDelete}
          className="m-collection-field-group__delete-group"
        />
      ))}
    </div>
  );
};

CollectionFieldGroup.propTypes = {
  collection: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])
  ).isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
  addTemplate: PropTypes.func.isRequired,
  editTemplate: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

CollectionFieldGroup.defaultProps = {
  defaultValue: '',
};

export default CollectionFieldGroup;
