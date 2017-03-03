import React, { PropTypes, Component } from 'react';
import Button from '../../../Button';
import Icon from '../../../Icon';
import { TextFieldGroup } from '../../../form';

import './style.scss';

class TagSearch extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onChange: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      terms: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(ev) {
    const terms = ev.target.value;
    this.setState({ terms });
    if (this.props.onChange) {
      this.props.onChange({ terms });
    }
  }

  handleSubmit() {
    if (this.state.terms.length === 0) {
      return;
    }

    this.setState((prevState) => {
      this.props.onSubmit({ tag: prevState.terms });

      return {
        terms: '',
      };
    });
  }

  render() {
    const { __ } = this.props;

    return (
      <div className="m-tags-search">
        <TextFieldGroup
          id="tags-search"
          name="terms"
          value={this.state.terms}
          className="m-tags-search__input"
          label={__('tags.form.search.label')}
          placeholder={__('tags.form.search.placeholder')}
          onChange={this.handleChange}
          showLabelforSr
        />
        <Button inline onClick={this.handleSubmit}><Icon type="search" /></Button>
      </div>
    );
  }
}

export default TagSearch;
