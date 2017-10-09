import React from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import { object } from '@kadira/storybook-addon-knobs';
import TagsForm from '../../src/components/TagsForm';
import { Code, ComponentWrapper } from '../presenters';

const Presenter = () => {
  const props = {
    tags: object('tags', [{ name: 'Humans', tag_id: 1 }, { name: 'Planet Express', tag_id: 2 }, { name: 'Head', tag_id: 3 }]),
  };

  return (
    <div>
      <ComponentWrapper>
        <TagsForm {...props} />
      </ComponentWrapper>
      <Code>
        {`
import TagsForm from './src/components/TagsForm';
export default () => (<TagsForm tags={tags} />);
        `}
      </Code>
    </div>
  );
};


export default Presenter;
