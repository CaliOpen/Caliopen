import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * This HoC requires ScrollSpy which provides scrollToHash
 * the hash to scroll to must be registred using ScrollToWhenHash. e.g:
 *
 * const MyElem1 = withScrollToHash()(
 *   ({ scrollToHash }) => (<button onClick={() => scrollToHash('bar')} />)}
 * );
 *
 * return (
 *   <ScrollSpy>
 *     <ScrollToWhenHash id="foo">
 *       <MyElem1 />
 *     </ScrollToWhenHash>
 *     <ScrollToWhenHash id="bar">
 *       <MyElem2 />
 *     </ScrollToWhenHash>
 *   </ScrollSpy>
 * )
 */

export default () => (Component) => {
  class ScrollToHash extends PureComponent {
    static contextTypes = {
      scrollToHash: PropTypes.func.isRequired,
    };

    render() {
      const props = {
        scrollToHash: this.context.scrollToHash,
      };

      return (<Component {...this.props} {...props} />);
    }
  }

  return ScrollToHash;
};
