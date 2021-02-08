import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

class Spinner extends PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number,
    width: PropTypes.number,
    display: PropTypes.oneOf(['inline', 'inline-block']),
    theme: PropTypes.oneOf(['default', 'bright']),
    className: PropTypes.string,
  };

  static defaultProps = {
    isLoading: true,
    height: 14,
    width: 14,
    display: 'inline-block',
    theme: 'default',
    className: undefined,
  };

  render() {
    const { isLoading, height, width, className, display, theme } = this.props;

    const spinnerProps = {
      className: classnames(className, 'm-spinner', {
        'm-spinner--inline-block': display === 'inline-block',
        'm-spinner--bright': theme === 'bright',
      }),
    };

    if (!isLoading) {
      return null;
    }

    return (
      <span {...spinnerProps}>
        <span className="m-spinner__icon">
          <svg viewBox="0 0 640 640" height={height} width={width}>
            <path d="m 590.54755,358.9064 c -6.67713,-1.73495 -16.85815,-7.99709 -20.47315,-12.5926 -7.73885,-9.83791 -9.03406,-14.17323 -10.21759,-34.20013 -0.60673,-10.26709 -2.00516,-24.36473 -3.1076,-31.32807 -3.59526,-22.7089 -14.25471,-54.93433 -22.1366,-66.92295 -1.62271,-2.46821 -5.65778,-9.2689 -8.96681,-15.11265 C 508.97576,169.31072 481.67649,140.17894 452.41389,120.60225 414.87201,95.486734 375.79457,82.607981 329.71466,80.164268 309.74501,79.105235 308.82406,78.936079 301.35544,74.955344 293.27355,70.647744 288.55679,65.664029 283.65202,56.25 281.24885,51.637427 280.72138,48.712636 280.72138,40 c 0,-8.712636 0.52747,-11.637428 2.93064,-16.25 4.86542,-9.338502 9.60471,-14.388774 17.40352,-18.5454996 L 308.47494,1.25 l 19.82504,0.00576 c 45.1974,0.013125 90.71825,11.3818445 134.82502,33.6722145 33.69714,17.029621 57.93446,34.914471 85.01861,62.735688 25.48335,26.176855 41.213,48.527605 57.50549,81.711345 20.68606,42.13235 30.81344,82.42236 32.6838,130.0268 0.73345,18.66795 0.60645,20.43461 -1.8717,26.03688 -6.39121,14.4484 -18.47868,23.05554 -33.64742,23.95939 -4.64133,0.27656 -10.16113,0.0553 -12.26623,-0.49167 z" />
          </svg>
        </span>
      </span>
    );
  }
}

export default Spinner;
