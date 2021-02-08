import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Link, Brand } from '../../components';
import { getConfig } from '../../services/config';
import './style.scss';

class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  state = { error: null, errorInfo: null };

  // eslint-disable-next-line react/sort-comp
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  getFeedbackLink = () => {
    const stackTrace = `
StackTrace:

\`\`\`
${this.state.error && this.state.error.toString()}
${this.state.errorInfo && this.state.errorInfo.componentStack}
\`\`\`
    `;
    const params = {
      title: this.state.error
        ? this.state.error.toString()
        : 'undefined catched error',
      category: 'bugs',
      tags: 'BSOD',
      body: stackTrace,
    };
    const esc =
      typeof encodeURIComponent !== 'undefined'
        ? encodeURIComponent
        : (str) => str;
    const queryString = Object.keys(params)
      .map((key) => `${key}=${esc(params[key])}`)
      .join('&');

    return `https://feedback.caliopen.org/new-topic?${queryString}`;
  };

  render() {
    if (this.state.errorInfo) {
      const { version } = getConfig();

      return (
        <div className="l-error-boundary">
          <div className="l-error-boundary__content">
            <header className="l-error-boundary__header">
              <Brand className="l-error-boundary__brand" theme="low" />
            </header>
            <section className="l-error-boundary__body">
              <h2>
                <Trans id="error-boundary.title">Something went wrong.</Trans>
              </h2>
              <div className="l-error-boundary__description">
                <Trans
                  id="error-boundary.description"
                  defaults="<0>We are are very sorry, an error occured on your account. It is what we call a «BSOD», that should never happens (but sometimes it does).</0><1>You can help us to resolve this bug by creating a new post on our feedback website (see link below). We will try to answer as soon as possible.</1><2>Of course you can browse <3>feedback.caliopen.org</3> and help us to improve Caliopen.</2>"
                  components={[
                    <p />,
                    <p />,
                    <p />,
                    <Link
                      href="https://feedback.caliopen.org"
                      target="_blank"
                      rel="noreferrer noopener"
                    />,
                  ]}
                />
              </div>
              <div>
                <Link
                  href={this.getFeedbackLink()}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Trans id="error-boundary.send-feedback">
                    Send us a feedback
                  </Trans>
                </Link>
              </div>
              <div>
                <Link href="/" button plain>
                  <Trans id="error-boundary.back-to-home">
                    Go back to home
                  </Trans>
                </Link>
              </div>
              <details
                className="l-error-boundary__error-details"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </details>
            </section>
            <footer className="l-error-boundary__footer">
              {version} - Be good.
            </footer>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
