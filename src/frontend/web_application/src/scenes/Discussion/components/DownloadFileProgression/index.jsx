import React from 'react';
import PropTypes from 'prop-types';

const DownloadFileProgression = React.forwardRef(
  ({ isFetching, value, max }, ref) => (
    <div ref={ref}>{isFetching && <progress value={value} max={max} />}</div>
  )
);

DownloadFileProgression.propTypes = {
  isFetching: PropTypes.bool,
  value: PropTypes.number,
  max: PropTypes.number,
};
DownloadFileProgression.defaultProps = {
  isFetching: false,
  value: undefined,
  max: undefined,
};

export default DownloadFileProgression;
