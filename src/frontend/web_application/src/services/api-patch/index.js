import isEqual from 'lodash.isequal';

const calcObjectForPatch = (newObj, previousObj) =>
  Array.from(new Set(Object.keys(newObj).concat(Object.keys(previousObj))))
    .reduce((acc, prop) => {
      if (!isEqual(newObj[prop], previousObj[prop])) {
        const nextProp = newObj[prop] ? { [prop]: newObj[prop] } : {};
        const previousProp = previousObj[prop] ? { [prop]: previousObj[prop] } : {};

        return {
          ...acc,
          ...nextProp,
          current_state: {
            ...acc.current_state,
            ...previousProp,
          },
        };
      }

      return acc;
    }, { current_state: {} });

export default calcObjectForPatch;
