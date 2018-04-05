import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { paramsSelector } from '../../store/selectors/router';
import { search, loadMore, getKey, hasMore } from '../../store/modules/search';
import Presenter from './presenter';

const searchSelector = state => state.search;

const mapStateToProps = createSelector(
  [paramsSelector, searchSelector],
  (params, searchState) => {
    if (!params) {
      return {};
    }

    const { resultsByKey } = searchState;
    const { term, doctype } = params;
    const hasMoreByDoctype = doctype && { [doctype]: hasMore(term, doctype, searchState) };

    return {
      term,
      doctype,
      hasMoreByDoctype,
      searchResults: resultsByKey[getKey(term, doctype)],
      searchResultsPreview: resultsByKey[getKey(term, '')],
    };
  }
);
const mapDispatchToProps = dispatch => bindActionCreators({
  search,
  loadMore,
}, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
