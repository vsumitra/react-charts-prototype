import React, { Component } from 'react';

class ChartTooltip extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentWillReceiveProps(nextProps) {
    const{ color } = nextProps;
    
    if(this.instance && color) {
      this.instance.style.borderTopColor = color;
    }
  }
  
  render() {

    if (!this.props.content) {
      return null;
    }
    let style = {
      transitionProperty: 'opacity, left, top', 
      transitionDuration: '.3s', 
      transitionTimingFunction: 'ease-in-out'};
    
    if (this.props.style) {
      style = {...style, ...this.props.style};
    }

    const arrowStyle = {
      position: 'absolute', 
      display: 'block', 
      height: 0, 
      width: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTopWidth: '6px',
      borderTopStyle: 'solid',
      borderTopColor: 'transparent'
    };

    return (
      <div id='chart-tooltip'
        className='tooltip bs-tooltip-top'
        style={style}
      >
        <div id='chart-tooltip-arrow' style={arrowStyle} ref={(e) => this.instance = e}></div>
        {this.props.content}
      </div>
    );
  }
}

export default ChartTooltip;
