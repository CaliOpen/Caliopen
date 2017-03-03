import React, { Component, PropTypes } from 'react';
import Button from '../Button';
import Icon from '../Icon';
import { FormGrid } from '../form';
import TagItem from './components/TagItem';
import TagSearch from './components/TagSearch';

import './style.scss';

class TagsForm extends Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    onSearch: PropTypes.func,
    onSearchSubmit: PropTypes.func,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    tags: [],
    onSearch: null,
    onSearchSubmit: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchTerms: '',
    };

    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }

  handleSearchChange({ terms }) {
    this.setState({
      searchTerms: terms,
    });

    if (this.props.onSearch) {
      this.props.onSearch({ terms });
    }
  }

  handleSearchSubmit(ev) {
    ev.preventDefault();
    if (this.props.onSearchSubmit) {
      this.props.onSearchSubmit(ev);
    }
  }

  handleCreate(ev) {
    ev.preventDefault();

    if (this.state.searchTerms.length > 0) {
      this.props.onCreate({ tagName: this.state.searchTerms });
    }
  }

  render() {
    const { __, onUpdate } = this.props;

    return (
      <div className="m-tags-form">
        <TagSearch
          onChange={this.handleSearchChange}
          onSubmit={this.handleSearchSubmit}
          __={__}
        />

        <div className="m-tags-form__section">
          {this.props.tags.map(tag =>
            <TagItem tag={tag} key={tag.tag_id} onUpdate={onUpdate} __={__} />
          )}
        </div>

        <FormGrid>
          <Button
            className="m-tags-form__action"
            onClick={this.handleCreate}
            plain
          >
            <Icon type="plus" spaced />
            {' '}
            {__('tags.action.create')}
          </Button>
        </FormGrid>
      </div>
    );
  }
}

export default TagsForm;
