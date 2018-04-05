import { Component } from 'react';
import PropTypes from 'prop-types';
import { TIMELINE_FILTER_ALL, TIMELINE_FILTER_RECEIVED, TIMELINE_FILTER_SENT, TIMELINE_FILTER_DRAFT } from '../../../../store/modules/message';

class TimelineFilter extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    filter: PropTypes.func.isRequired,
    currentFilter: PropTypes.string.isRequired,
    i18n: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
  };
  state = {};

  componentWillMount() {
    const { i18n } = this.props;

    this.translations = {
      [TIMELINE_FILTER_ALL]: i18n._('timeline-filter.options.all', { defaults: 'All' }),
      [TIMELINE_FILTER_RECEIVED]: i18n._('timeline-filter.options.received', { defaults: 'Received' }),
      [TIMELINE_FILTER_SENT]: i18n._('timeline-filter.options.sent', { defaults: 'Sent' }),
      [TIMELINE_FILTER_DRAFT]: i18n._('timeline-filter.options.draft', { defaults: 'Drafts' }),
    };
  }

  componentWillReceiveProps() {

  }

  handleSelect = type => this.props.filter(type);

  render() {
    const { render, currentFilter } = this.props;

    const options = [
      TIMELINE_FILTER_ALL,
      TIMELINE_FILTER_RECEIVED,
      TIMELINE_FILTER_SENT,
      TIMELINE_FILTER_DRAFT,
    ].map(filter => (
      {
        label: this.translations[filter],
        value: filter,
        select: () => this.handleSelect(filter),
      }
    ));

    return render(options, currentFilter);
  }
}

export default TimelineFilter;
