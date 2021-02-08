import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { search, loadMore, getKey, hasMore } from '../../store/modules/search';
import { withSearchParams } from '../../modules/routing';
import Presenter from './presenter';

const searchSelector = (state) => state.search;
const searchParamsSelector = (state, { searchParams: { term, doctype } }) => ({
  term,
  doctype,
});

const mapStateToProps = createSelector(
  [searchParamsSelector, searchSelector],
  (searchParams, searchState) => {
    const { resultsByKey } = searchState;
    const { term, doctype } = searchParams;
    const hasMoreByDoctype = doctype && {
      [doctype]: hasMore(term, doctype, searchState),
    };

    return {
      term,
      doctype,
      hasMoreByDoctype,
      searchResults: resultsByKey[getKey(term, doctype)],
      searchResultsPreview: resultsByKey[getKey(term, '')],
    };
  }
);
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      search,
      loadMore,
    },
    dispatch
  );

export default compose(
  withSearchParams(),
  connect(mapStateToProps, mapDispatchToProps)
)(Presenter);
