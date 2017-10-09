import React from 'react';
import Markdown from 'react-markdown';
import input from './CHANGELOG.md';

const styles = {
  main: {
    margin: 30,
  },
};

const Changelog = () => (
  <div style={styles.main}>
    <Markdown source={input} />
  </div>
);

export default Changelog;
