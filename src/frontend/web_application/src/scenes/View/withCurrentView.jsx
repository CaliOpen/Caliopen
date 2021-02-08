import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { View, WithViewModel, requestMessages } from '../../modules/view';
import { withRouteParams } from '../../modules/routing';
import { getModuleStateSelector } from '../../store/selectors/getModuleStateSelector';

const withViewModel = () => (C) =>
  withRouteParams()(({ routeParams: { viewId }, ...props }) => (
    <WithViewModel
      viewId={viewId}
      render={({ view }) => <C view={view} {...props} />}
    />
  ));

const viewModelSelector = (state, { view }) => view;

const viewSelector = createSelector(
  [viewModelSelector, getModuleStateSelector('view')],
  (viewModel, { viewById }) => viewById[viewModel.id]
);

const mapStateToProps = createSelector(
  [viewModelSelector, getModuleStateSelector('message'), viewSelector],
  (view, { messagesById }, viewState) => ({
    view,
    isFetching: viewState && viewState.isFetching,
    messages: Object.keys(messagesById)
      .map((messageId) => messagesById[messageId])
      .filter((message) => view.has({ message }))
      .sort((a, b) => (new Date(a.date_sort) - new Date(b.date_sort)) * -1),
  })
);

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      requestMessages: requestMessages.bind(null, { view: ownProps.view }),
    },
    dispatch
  );

const connecting = compose(
  withViewModel(),
  connect(mapStateToProps, mapDispatchToProps)
);

export const withCurrentView = () => (C) => {
  @connecting
  class WithCurrentView extends Component {
    static propTypes = {
      requestMessages: PropTypes.func.isRequired,
      messages: PropTypes.arrayOf(PropTypes.shape({})),
      isFetching: PropTypes.bool,
      view: PropTypes.instanceOf(View),
    };

    static defaultProps = {
      messages: [],
      isFetching: false,
    };

    componentDidMount() {
      this.fetchMessages();
    }

    // componentDidUpdate(prevProps) {
    //   // if (prevProps.isFetching) {}
    // }

    fetchMessages = () => {
      const { view, isFetching } = this.props;

      if (!isFetching) {
        this.props.requestMessages({ view });
      }
    };

    render() {
      const { view, messages, isFetching, ...props } = this.props;

      const withProps = {
        view,
        messages,
        isFetching,
      };

      return <C {...withProps} {...props} />;
    }
  }

  return WithCurrentView;
};
