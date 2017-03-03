import React, { Component, PropTypes } from 'react';
import Spinner from '../../components/Spinner';
import TagsForm from '../../components/TagsForm';
import './style.scss';

function tagSelector(tags, terms) {
  return tags.filter(tag => tag.name.toLowerCase().indexOf(terms.toLowerCase()) !== -1);
}

function generateStateFromProps(props, prevState) {
  if (prevState.terms.length <= 0) {
    return { tags: [...props.tags] };
  }

  return {
    tags: tagSelector(props.tags, prevState.terms),
  };
}

class Tags extends Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    requestTags: PropTypes.func.isRequired,
    createTag: PropTypes.func.isRequired,
    updateTag: PropTypes.func.isRequired,
    isFetching: PropTypes.bool,
  };

  static defaultProps = {
    tags: [],
    isFetching: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      terms: '',
      tags: [],
    };

    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  componentDidMount() {
    this.props.requestTags();
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  handleSearchChange({ terms }) {
    this.setState({ terms });
    this.state.tags = tagSelector(this.props.tags, terms);
  }

  render() {
    const { isFetching, createTag, updateTag } = this.props;

    return (
      <div className="s-devices">
        <Spinner isLoading={isFetching} />
        <TagsForm
          tags={this.state.tags}
          onSearch={this.handleSearchChange}
          onUpdate={updateTag}
          onCreate={createTag}
        />
      </div>
    );
  }
}

export default Tags;
