import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { I18nProvider } from 'lingui-react';
import { unpackCatalog } from 'lingui-i18n';
import { getLanguage } from '../../';

// eslint-disable-next-line import/no-extraneous-dependencies
const linguiDev = process.env.NODE_ENV !== 'production' ? require('lingui-i18n/dev') : undefined;

class I18nLoader extends Component {
  static propTypes = {
    locale: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  static getCatalogSync = (language) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const catalog = require(`../../../../../locale/${language}/messages.js`);

    return unpackCatalog(catalog);
  }

  static getCatalog = async (language) => {
    const catalog = await import(/* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */`../../../../../locale/${language}/messages.js`);

    return unpackCatalog(catalog);
  }

  state = {
    catalogs: {},
  }

  componentWillMount() {
    const language = this.getLanguageFromProps(this.props);
    const catalog = this.constructor.getCatalogSync(language);

    if (catalog) {
      this.setState({
        catalogs: {
          [language]: catalog,
        },
      });
    }
  }

  componentDidMount() {
    this.updateCatalog(this.getLanguageFromProps(this.props));
  }

  shouldComponentUpdate(nextProps, nextState) {
    const language = this.getLanguageFromProps(nextProps);
    const { catalogs } = nextState;

    if (language !== this.getLanguageFromProps(this.props) && !catalogs[language]) {
      this.updateCatalog(language);

      return false;
    }

    return true;
  }

  getLanguageFromProps = props => getLanguage([props.locale])

  updateCatalog = async (language) => {
    const catalog = await this.constructor.getCatalog(language);

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalog,
      },
    }));
  }

  render() {
    const { children } = this.props;
    const { catalogs } = this.state;
    const language = this.getLanguageFromProps(this.props);

    // Skip rendering when catalog isn't loaded.
    if (!catalogs[language]) {
      return null;
    }

    return (
      <I18nProvider language={language} catalogs={catalogs} development={linguiDev}>
        {children}
      </I18nProvider>
    );
  }
}

export default I18nLoader;
