import { Component } from 'react';
import PropTypes from 'prop-types';

class WithTags extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    requestTags: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    isInvalidated: PropTypes.bool,
  };

  static defaultProps = {
    tags: undefined,
    isFetching: false,
    isInvalidated: false,
  };

  state = {
    initialized: false,
  };

  componentDidMount() {
    const { requestTags, tags, isInvalidated, isFetching } = this.props;
    if (!isFetching && (!tags.length || isInvalidated)) {
      requestTags().then(() => this.setState({ initialized: true }));
    }
  }

  render() {
    const { tags, isFetching, render } = this.props;

    if (!tags.length && !this.state.initialized) {
      return null;
    }

    return render(tags, isFetching);
  }
}

export default WithTags;
