import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

const DefList = ({ className, definitions }) => {
  const nodes = definitions.reduce((prev, definition) => {
    prev.push(
      <dt className="m-def-list__title" key={prev.length + 1}>
        {definition.title}
      </dt>
    );
    definition.descriptions.forEach((description) => {
      prev.push(
        <dd className="m-def-list__def" key={prev.length + 1}>
          {description}
        </dd>
      );
    });

    return prev;
  }, []);

  return <dl className={classnames('m-def-list', className)}>{nodes}</dl>;
};

DefList.propTypes = {
  className: PropTypes.string,
  definitions: PropTypes.arrayOf(PropTypes.shape({})),
};
DefList.defaultProps = {
  className: undefined,
  definitions: [],
};

export default DefList;
