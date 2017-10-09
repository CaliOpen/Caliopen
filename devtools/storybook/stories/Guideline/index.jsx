import React from 'react';
import './style.scss';
import imageExample from '../assets/example.png';

const styles = {
  main: {
    margin: 15,
    maxWidth: 600,
    lineHeight: 1.4,
    fontFamily: '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
  }
};

const Guideline = () => (
  <div style={styles.main}>
    <h1>Guidelines</h1>

    <h2>Typography</h2>

    <p className="typo">Font sizes: ...</p>

    <h2>Spacing</h2>

    <p>Space between two elements</p>

    <h2>Height</h2>

    <p>2.6rem (~42px) the minimum value for touchable elements</p>

    <h2>Examples</h2>

    <p><img src={imageExample} alt="example" /></p>
  </div>
);

export default Guideline;
