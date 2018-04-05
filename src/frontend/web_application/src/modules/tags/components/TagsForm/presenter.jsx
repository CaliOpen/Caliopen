import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import { Trans } from 'lingui-react';
import isequal from 'lodash.isequal';
import { Button, Icon, DropdownMenu, VerticalMenu, VerticalMenuItem } from '../../../../components';
import { getTagLabel } from '../../';
import TagItem from '../TagItem';
import TagFieldGroup from '../TagFieldGroup';
import { searchTags } from '../../services/searchTags';
import { addEventListener } from '../../../../services/event-manager';
import './style.scss';

const generateStateFromProps = ({ tags }) => ({
  tags,
});

class TagsForm extends Component {
  static propTypes = {
    userTags: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    updateTags: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    userTags: [],
    tags: [],
  };

  state = {
    tags: [],
    errors: [],
    searchTerms: '',
    isTagCollectionUpdating: false,
    foundTags: [],
  };

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentDidMount() {
    this.unsubscribeClickEvent = addEventListener('click', (ev) => {
      const { target } = ev;
      if (target !== this.dropdownElement && target !== this.inpputSearchElement) {
        this.setState({ foundTags: [] });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isequal(nextProps.tags, this.props.tags)) {
      this.setState(generateStateFromProps(nextProps));
    }
  }

  getAvailableTags = () => {
    const { userTags } = this.props;
    const tags = new Set(this.state.tags);

    return userTags.filter(tag => !tags.has(tag));
  }

  updateTags = async () => {
    const { updateTags } = this.props;
    this.setState({ isTagCollectionUpdating: true });
    try {
      await updateTags({ tags: this.state.tags });
    } catch (errors) {
      // TODO: the error should given by the backend (and translated)
      this.setState({
        errors: [(<Trans id="settings.tag.form.error.create_fail">Unable to create the tag. A tag with the same id may already exist.</Trans>)],
        isTagCollectionUpdating: false,
      });

      return Promise.reject();
    }
    this.setState({ isTagCollectionUpdating: false });

    return undefined;
  }

  handleSearchChange = async (searchTerms) => {
    const { i18n } = this.props;
    if (searchTerms === '') {
      this.setState({ searchTerms, foundTags: this.getAvailableTags().slice(0, 20), errors: [] });

      return;
    }

    const foundTags = await searchTags(i18n, this.getAvailableTags(), searchTerms);
    this.setState({ searchTerms, foundTags, errors: [] });
  }

  handleSearchFocus = () => {
    if (this.state.searchTerms === '') {
      this.setState({ foundTags: this.getAvailableTags().slice(0, 20) });
    }
  }

  handleAddNewTag = async (terms) => {
    if (terms.length > 0) {
      this.setState(
        prevState => ({
          tags: [
            ...prevState.tags,
            { label: terms },
          ],
        }),
        async () => {
          await this.updateTags();
          this.handleSearchChange('');
        }
      );
    }
  }

  createHandleAddTag = tag => async () => {
    this.setState(
      prevState => ({
        tags: [
          ...prevState.tags,
          tag,
        ],
      }),
      async () => {
        await this.updateTags();
        this.handleSearchChange('');
      }
    );
  }

  handleDeleteTag = ({ tag }) => {
    this.setState(
      prevState => ({ tags: prevState.tags.filter(item => item !== tag) }),
      () => this.updateTags()
    );
  }

  render() {
    const { i18n } = this.props;
    const dropdownId = uuidV1();

    return (
      <div className="m-tags-form">
        <div className="m-tags-form__section">
          {this.state.tags.length > 0 && this.state.tags.map(tag =>
            <TagItem tag={tag} key={tag.name} onDelete={this.handleDeleteTag} />)}
        </div>

        <div className="m-tags-form__section">
          <TagFieldGroup
            errors={this.state.errors}
            terms={this.state.searchTerms}
            input={{
              onChange: this.handleSearchChange,
              onFocus: this.handleSearchFocus,
              inputRef: (el) => { this.inpputSearchElement = el; },
            }}
            onSubmit={this.handleAddNewTag}
          />
          <DropdownMenu
            id={dropdownId}
            show={this.state.foundTags.length > 0}
            className="m-tags-form__dropdown"
            dropdownRef={(el) => { this.dropdownElement = el; }}
          >
            <VerticalMenu>
              {this.state.foundTags.map(tag => (
                <VerticalMenuItem key={tag.name}>
                  <Button
                    className="m-tags-form__found-tag"
                    display="expanded"
                    shape="plain"
                    onClick={this.createHandleAddTag(tag)}
                  >
                    <span className="m-tags-form__found-tag-text">{getTagLabel(i18n, tag)}</span>
                    {' '}
                    <Icon type="plus" />
                  </Button>
                </VerticalMenuItem>
              ))}
            </VerticalMenu>
          </DropdownMenu>
        </div>
      </div>
    );
  }
}

export default TagsForm;
