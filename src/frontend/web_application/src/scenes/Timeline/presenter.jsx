import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import isEqual from 'lodash.isequal';
import { Trans } from '@lingui/react';
import { withScrollManager, ScrollDetector } from '../../modules/scroll';
import {
  Button,
  InfiniteScroll,
  ActionBarWrapper,
  ActionBar,
  CheckboxFieldGroup,
  PlaceholderBlock,
  TextBlock,
} from '../../components';
import DiscussionItem from './components/DiscussionItem';
import { withSettings } from '../../modules/settings';

// XXX waiting for API
// import DiscussionSelector from './components/DiscussionSelector';

import './style.scss';
import './timeline-action-bar.scss';

const LOAD_MORE_THROTTLE = 1000;
const FILTER_RANGE_DEFAULT = { min: 0, max: 10 };
const FILTER_RANGE_ALL = { min: -10, max: 10 };

@withSettings()
@withScrollManager()
class Timeline extends Component {
  static propTypes = {
    user: PropTypes.shape({}),
    getUser: PropTypes.func.isRequired,
    isUserFetching: PropTypes.bool.isRequired,
    requestDiscussions: PropTypes.func.isRequired,
    // XXX no API for now
    // deleteDiscussion: PropTypes.func.isRequired,
    loadMore: PropTypes.func.isRequired,
    discussions: PropTypes.arrayOf(PropTypes.shape({})),
    // tags: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    didInvalidate: PropTypes.bool,
    hasMore: PropTypes.bool,
    // updateDiscussionTags: PropTypes.func.isRequired,
    settings: PropTypes.shape({}).isRequired,
    filterImportance: PropTypes.func.isRequired,
    importanceRange: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
  };

  static defaultProps = {
    discussions: [],
    // tags: [],
    user: {},
    isFetching: false,
    didInvalidate: false,
    hasMore: false,
  };

  state = {
    initialized: false,
    selectedDiscussions: [],
    // XXX no API for now
    isTagModalOpen: false,
    // isDeleting: false,
  };

  componentDidMount() {
    const { user, isUserFetching, getUser } = this.props;

    if (!(user || isUserFetching)) {
      getUser();
    }

    this.loadDiscussions(this.props);

    this.throttledLoadMore = throttle(
      () => this.props.loadMore(),
      LOAD_MORE_THROTTLE,
      { trailing: false }
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.loadDiscussions(nextProps);
  }

  onSelectDiscussion = (type, discussionId) => {
    if (type === 'add') {
      this.setState((prevState) => ({
        ...prevState,
        selectedDiscussions: [...prevState.selectedDiscussions, discussionId],
      }));
    }

    if (type === 'remove') {
      this.setState((prevState) => ({
        ...prevState,
        selectedDiscussions: [...prevState.selectedDiscussions].filter(
          (item) => item !== discussionId
        ),
      }));
    }
  };

  onSelectAllDiscussions = (type) => {
    if (type === 'select') {
      const { discussions } = this.props;

      this.setState((prevState) => ({
        ...prevState,
        selectedDiscussions: discussions.map(
          (discussion) => discussion.discussion_id
        ),
      }));
    }

    if (type === 'unselect') {
      this.setState((prevState) => ({ ...prevState, selectedDiscussions: [] }));
    }
  };

  loadDiscussions = async (props, force = false) => {
    const { requestDiscussions, isFetching, didInvalidate } = props;
    if ((!this.state.initialized || force || didInvalidate) && !isFetching) {
      // "initialized" is not well named,
      // we consider it "initialized" as soon as we start fetching messages to prevent multiple
      // fetchs because setState would be applied at the very end after multiple
      // UNSAFE_componentWillReceiveProps
      this.setState({ initialized: true });
      requestDiscussions();
    }

    return Promise.resolve();
  };

  loadMore = () => {
    if (this.props.hasMore) {
      this.throttledLoadMore();
    }
  };

  handleToggleShowSpam = () => {
    const { filterImportance, importanceRange } = this.props;

    const nextRange = isEqual(importanceRange, FILTER_RANGE_DEFAULT)
      ? FILTER_RANGE_ALL
      : FILTER_RANGE_DEFAULT;

    filterImportance(nextRange);
  };

  makeHandleClickClearNotifications = (cb) => () => {
    this.loadDiscussions(this.props, true);
    cb();
  };

  renderPlaceholder = () => (
    <ul className="s-timeline__discussion-list">
      {[1, 2, 3, 4, 5].map((n) => (
        <PlaceholderBlock key={n} className="s-timeline__discussion" />
      ))}
    </ul>
  );

  renderDiscussions() {
    const { discussions, user, settings } = this.props;
    const { selectedDiscussions } = this.state;

    if (!discussions.length) {
      return this.renderPlaceholder();
    }

    return (
      <ul className="s-timeline__discussion-list">
        {discussions.map((discussion) => (
          <DiscussionItem
            key={discussion.discussion_id}
            className="s-timeline__discussion"
            user={user}
            discussion={discussion}
            onSelectDiscussion={this.onSelectDiscussion}
            onSelectAllDiscussions={this.onSelectAllDiscussions}
            isDiscussionSelected={selectedDiscussions.includes(
              discussion.discussion_id
            )}
            settings={settings}
          />
        ))}
      </ul>
    );
  }

  renderActionBar() {
    const { isFetching, importanceRange } = this.props;
    const hasSpam = isEqual(importanceRange, FILTER_RANGE_ALL);
    // const nbSelectedDiscussions = this.state.selectedDiscussions.length;

    return (
      <ScrollDetector
        offset={136}
        render={(isSticky) => (
          <ActionBarWrapper isSticky={isSticky}>
            <ActionBar
              hr={false}
              isLoading={isFetching}
              actionsNode={
                <div className="s-timeline-action-bar">
                  <TextBlock>
                    <CheckboxFieldGroup
                      className="s-timeline-action-bar__filters"
                      displaySwitch
                      showTextLabel
                      label={
                        <Trans id="timeline.action.display-spam">
                          Show spam
                        </Trans>
                      }
                      onChange={this.handleToggleShowSpam}
                      checked={hasSpam}
                    />
                  </TextBlock>
                  {/*  <DiscussionSelector
                    count={nbSelectedDiscussions}
                    checked={nbSelectedDiscussions > 0
                        && nbSelectedDiscussions === discussions.length}
                        totalCount={discussions.length}
                        onSelectAllDiscussions={this.onSelectAllDiscussions}
                        onEditTags={this.handleOpenTags}
                        onDeleteDiscussions={this.handleDeleteDiscussions}
                        isDeleting={this.state.isDeleting}
                        indeterminate={nbSelectedDiscussions > 0
                            && nbSelectedDiscussions < discussions.length}
                          />
                  */}
                </div>
              }
            />
          </ActionBarWrapper>
        )}
      />
    );
  }

  render() {
    const { hasMore } = this.props;

    return (
      <Fragment>
        <section className="s-timeline">
          {this.renderActionBar()}
          <InfiniteScroll onReachBottom={this.loadMore}>
            <Fragment>{this.renderDiscussions()}</Fragment>
          </InfiniteScroll>
        </section>
        {hasMore && (
          <div className="s-timeline__load-more">
            <Button shape="hollow" onClick={this.loadMore}>
              <Trans id="general.action.load_more">Load more</Trans>
            </Button>
          </div>
        )}
      </Fragment>
    );
  }
}

export default Timeline;
