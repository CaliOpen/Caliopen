import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tour from './components/Tour';
import Button from '../../../../components/Button';

class TakeATour extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
  };
  state = {
    isTourActive: false,
  };

  handleToggleTour = () => {
    this.setState(prevState => ({ isTourActive: !prevState.isTourActive }));
  }

  handleChangeStep = (step) => {
    this.setState({ tourStep: step });
  }

  handleclose = () => {
    this.setState({ isTourActive: false });
  }

  render() {
    const { __ } = this.props;

    const steps = [
      {
        selector: '.s-timeline',
        content: (
          <div>
            <h2>{__('take-a-tour.step.intro.title')}</h2>
            <div dangerouslySetInnerHTML={__('take-a-tour.step.intro.content', { withHTML: true })} />
          </div>
        ),
        position: 'center',
      },
      {
        selector: '.l-header__m-search-field',
        content: (
          <div>
            <h2>{__('take-a-tour.step.search.title')}</h2>
            <div dangerouslySetInnerHTML={__('take-a-tour.step.search.content', { withHTML: true })} />
          </div>
        ),
      },
      {
        selector: '.l-header__user',
        content: (
          <div>
            <h2>{__('take-a-tour.step.user-menu.title')}</h2>
            <div dangerouslySetInnerHTML={__('take-a-tour.step.user-menu.content', { withHTML: true })} />
          </div>
        ),
        position: 'bottom',
      },
      {
        selector: '.l-call-to-action',
        content: (
          <div>
            <h2>{__('take-a-tour.step.call-to-action.title')}</h2>
            <div dangerouslySetInnerHTML={__('take-a-tour.step.call-to-action.content', { withHTML: true })} />
          </div>
        ),
      },
      {
        selector: '#toggle-IL_navigation_slider_dropdown',
        content: (
          <div>
            <h2>{__('take-a-tour.step.importance-slider.title')}</h2>
            <div dangerouslySetInnerHTML={__('take-a-tour.step.importance-slider.content', { withHTML: true })} />
          </div>
        ),
      },
    ];

    return (
      <Button onClick={this.handleToggleTour} icon="question-circle" display="expanded">
        <span className="show-for-sr">{__('take-a-tour.action.toggle')}</span>
        <Tour
          isOpen={this.state.isTourActive}
          step={this.state.tourStep}
          onRequestClose={this.handleclose}
          steps={steps}
          badgeContent={(current, total) => __('take-a-tour.current-step', { current, total })}
          showNavigation={false}
          skipButton={__('take-a-tour.action.skip')}
          prevButton={__('take-a-tour.action.prev')}
          nextButton={__('take-a-tour.action.next')}
          lastStepNextButton={__('take-a-tour.action.last-step')}
          closeButton={__('take-a-tour.action.close')}
        />
      </Button>
    );
  }
}

export default TakeATour;
