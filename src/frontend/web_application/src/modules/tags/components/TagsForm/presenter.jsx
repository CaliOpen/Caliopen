import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import isequal from 'lodash.isequal';
import {
  Button,
  Icon,
  Dropdown,
  VerticalMenu,
  VerticalMenuItem,
} from '../../../../components';
import { getTagLabel } from '../..';
import TagItem from '../TagItem';
import TagFieldGroup from '../TagFieldGroup';
import { searchTags } from '../../services/searchTags';
import { addEventListener } from '../../../../services/event-manager';
import './style.scss';

class TagsForm extends Component {
  static propTypes = {
    userTags: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.shape({})),
    updateTags: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    userTags: [],
    tags: [],
  };

  static initialState = {
    tags: [],
    errors: [],
    searchTerms: '',
    isTagCollectionUpdating: false,
    foundTags: [],
    searchHasFocus: false,
  };

  static generateStateFromProps({ tags, userTags }, prevState) {
    return {
      ...prevState,
      tags,
      foundTags: this.getAvailableTags({ userTags, tags }).slice(0, 20),
    };
  }

  static getAvailableTags({ userTags, tags }) {
    const tagSet = new Set(tags);

    return userTags.filter((tag) => !tagSet.has(tag));
  }

  state = this.constructor.generateStateFromProps(
    this.props,
    this.constructor.initialState
  );

  dropdownElement = createRef();

  componentDidMount() {
    this.unsubscribeClickEvent = addEventListener('click', (ev) => {
      const { target } = ev;
      ev.preventDefault();

      if (
        target !== this.dropdownElement.current &&
        target !== this.inpputSearchElement
      ) {
        this.setState({ searchHasFocus: false });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const propNames = ['tags'];
    const hasChanged = propNames.some(
      (propName) => !isequal(this.props[propName], prevProps[propName])
    );

    if (hasChanged) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((prevState) =>
        this.constructor.generateStateFromProps(this.props, prevState)
      );
    }
  }

  updateTags = async () => {
    const { updateTags } = this.props;
    this.setState({ isTagCollectionUpdating: true });
    try {
      await updateTags({ tags: this.state.tags });
    } catch (errors) {
      // TODO: the error should given by the backend (and translated)
      this.setState({
        errors: [
          <Trans id="settings.tag.form.error.create_fail">
            Unable to create the tag. A tag with the same id may already exist.
          </Trans>,
        ],
        isTagCollectionUpdating: false,
      });

      return Promise.reject();
    }
    this.setState({ isTagCollectionUpdating: false });

    return undefined;
  };

  handleSearchChange = async (searchTerms) => {
    const { i18n, userTags } = this.props;
    if (searchTerms === '') {
      this.setState((prevState) => ({
        searchTerms,
        foundTags: this.constructor
          .getAvailableTags({ userTags, tags: prevState.tags })
          .slice(0, 20),
        errors: [],
      }));

      return;
    }

    this.setState(async (prevState) => {
      const foundTags = await searchTags(
        i18n,
        this.constructor.getAvailableTags({
          userTags,
          tags: prevState.tags,
        }),
        searchTerms
      );

      return { searchTerms, foundTags, errors: [] };
    });
  };

  handleSearchFocus = () => {
    const { userTags } = this.props;
    if (this.state.searchTerms === '') {
      this.setState((prevState) => ({
        foundTags: this.constructor
          .getAvailableTags({
            userTags,
            tags: prevState.tags,
          })
          .slice(0, 20),
        searchHasFocus: true,
      }));
    }
  };

  handleAddNewTag = async (terms) => {
    if (terms.length > 0) {
      this.setState(
        (prevState) => ({
          tags: [...prevState.tags, { label: terms }],
        }),
        async () => {
          await this.updateTags();
          this.handleSearchChange('');
        }
      );
    }
  };

  createHandleAddTag = (tag) => async () => {
    this.handleSearchChange('');
    this.setState(
      (prevState) => ({
        tags: [...prevState.tags, tag],
      }),
      async () => {
        await this.updateTags();
      }
    );
  };

  handleDeleteTag = ({ tag }) => {
    this.setState(
      (prevState) => ({ tags: prevState.tags.filter((item) => item !== tag) }),
      () => this.updateTags()
    );
  };

  render() {
    const { i18n } = this.props;

    return (
      <div className="m-tags-form">
        <div className="m-tags-form__section">
          {this.state.tags.length > 0 &&
            this.state.tags.map((tag) => (
              <TagItem
                tag={tag}
                key={tag.name}
                onDelete={this.handleDeleteTag}
              />
            ))}
        </div>

        <div className="m-tags-form__section">
          <TagFieldGroup
            errors={this.state.errors}
            terms={this.state.searchTerms}
            input={{
              onChange: this.handleSearchChange,
              onFocus: this.handleSearchFocus,
              inputRef: (el) => {
                this.inpputSearchElement = el;
              },
            }}
            onSubmit={this.handleAddNewTag}
          />
          <Dropdown
            show={this.state.searchHasFocus && this.state.foundTags.length > 0}
            className="m-tags-form__dropdown"
            ref={this.dropdownElement}
            closeOnClick="doNotClose"
          >
            <VerticalMenu>
              {this.state.foundTags.map((tag) => (
                <VerticalMenuItem key={tag.name}>
                  <Button
                    className="m-tags-form__found-tag"
                    display="expanded"
                    shape="plain"
                    onClick={this.createHandleAddTag(tag)}
                  >
                    <span className="m-tags-form__found-tag-text">
                      {getTagLabel(i18n, tag)}
                    </span>{' '}
                    <Icon type="plus" />
                  </Button>
                </VerticalMenuItem>
              ))}
            </VerticalMenu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default TagsForm;
