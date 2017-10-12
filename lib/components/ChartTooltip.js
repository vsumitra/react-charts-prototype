import React from 'react';

const ChartTooltip = (props) => {
  const { content, style } = props;
  if (!content) {
    return null;
  }

  const arrowStyle = style ? { backgroundColor: style.backgroundColor } : {};
  return(<div id="chart-tooltip" 
    className="tooltip bs-tooltip-top"
    style={{
      transitionProperty: 'opacity, left, top', 
      transitionDuration: '.3s', 
      transitionTimingFunction: 'ease-in-out'}}
  >
    <div className="arrow" style={arrowStyle}></div>
    <div style={style}>
      {content}
    </div>
  </div>
  );
};

export default ChartTooltip;
