import { useLocation } from 'react-router-dom';
import { getSearchParams } from '../services/getSearchParams';

export function useSearchParams() {
  const { search } = useLocation();

  return getSearchParams(search);
}
