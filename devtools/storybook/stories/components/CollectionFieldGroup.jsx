import React, { Component, PropTypes } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { array } from '@kadira/storybook-addon-knobs';
import { CollectionFieldGroup, TextFieldGroup } from '../../src/components/form';
import { Code, ComponentWrapper } from '../presenters';

const Presenter = () => {
  const addTemplate = ({ item, onChange, ...props }) => {
    const handleChange = ev => onChange({ item: ev.target.value });

    return (
      <TextFieldGroup label="Add an item" showLabelforSr value={item} onChange={handleChange} {...props} />
    );
  };

  const editTemplate = ({ item, onChange, ...props }) => {
    const handleChange = ev => onChange({ item: ev.target.value });

    return (
      <TextFieldGroup label="An item" showLabelforSr value={item} onChange={handleChange} {...props} />
    );
  };

  const props = {
    collection: array('collection', ['foo', 'bar', 'bazzz']),
  };

  return (
    <div>
      <ComponentWrapper inline >
        <CollectionFieldGroup
          onChange={action('changed')}
          addTemplate={addTemplate}
          editTemplate={editTemplate}
          {...props}
        />
      </ComponentWrapper>
      <Code>
        {`
import { CollectionFieldGroup } from './src/components/form';

const collection = ['foo', 'bar', 'bazzz'];
const handleChange = (updatedColl) => {
// do the things with updated collection
};

const addTemplate = ({ item, onChange, ...props }) => {
const handleChange = ev => onChange({ item: ev.target.value });

return (
  <TextFieldGroup label="Add an item" showLabelforSr value={item} onChange={handleChange} {...props} />
);
};

const editTemplate = ({ item, onChange, ...props }) => {
const handleChange = ev => onChange({ item: ev.target.value });

return (
  <TextFieldGroup label="An item" showLabelforSr value={item} onChange={handleChange} {...props} />
);
};

<CollectionFieldGroup
collection={collection}
onChange={action('changed')}
addTemplate={addTemplate}
editTemplate={editTemplate}
/>
        `}
      </Code>
    </div>
  );
};

export default Presenter;
