import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { I18nProvider } from '@lingui/react';
import { getBestLocale } from '../../services/getBestLocale';
import { getLanguage } from '../../services/getLanguage';

class I18nLoader extends Component {
  static propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    locale: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  static getCatalogSync = (language) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const catalog = require(`../../../../../locale/${language}/messages.js`);

    return catalog;
  };

  static getCatalog = async (language) => {
    const catalog = await import(
      /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */ `../../../../../locale/${language}/messages.js`
    );

    return catalog;
  };

  state = {
    catalogs: {},
  };

  UNSAFE_componentWillMount() {
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

    if (
      language !== this.getLanguageFromProps(this.props) &&
      !catalogs[language]
    ) {
      this.updateCatalog(language);

      return false;
    }

    return true;
  }

  getLanguageFromProps = (props) => getLanguage(getBestLocale([props.locale]));

  updateCatalog = async (language) => {
    const catalog = await this.constructor.getCatalog(language);

    this.setState((state) => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalog,
      },
    }));
  };

  render() {
    const { children } = this.props;
    const { catalogs } = this.state;
    const language = this.getLanguageFromProps(this.props);

    // Skip rendering when catalog isn't loaded.
    if (!catalogs[language]) {
      return null;
    }

    return (
      <I18nProvider language={language} catalogs={catalogs}>
        {children}
      </I18nProvider>
    );
  }
}

export default I18nLoader;
