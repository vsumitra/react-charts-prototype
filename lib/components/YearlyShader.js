import React, { Component } from 'react';
import { TimeRange } from 'pondjs';
import moment from 'moment';


class YearlyShader extends Component {

  viewport() {
    const { width, timeScale } = this.props;
    const viewBeginTime = timeScale.invert(0);
    const viewEndTime = timeScale.invert(width);
    return new TimeRange(viewBeginTime, viewEndTime);
  }

  renderBrush(key, timeRange, style) {
    const { timeScale, height } = this.props;

    if (!timeRange) {
      return <g />;
    }

    // Style of the brush area
    const brushDefaultStyle = {
      fill: '#777',
      fillOpacity: 0.3,
      stroke: 'transparent',
      shapeRendering: 'crispEdges'
    };
    const brushStyle = {...brushDefaultStyle, ...style };

    if (!this.viewport().disjoint(timeRange)) {
      const range = timeRange.intersection(this.viewport());
      const begin = range.begin();
      const end = range.end();
      const [x, y] = [timeScale(begin), 0];
      const endPos = timeScale(end);
      let width = endPos - x;
      if (width < 1) {
        width = 1;
      }

      const bounds = { x, y, width, height: height - 10 };

      return (
        <rect
          key={key}
          {...bounds}
          style={brushStyle}
          pointerEvents="all"
          transform={`translate(0,${5})`}
        />
      );
    }
    return <g />;
  }

  render() {
    const { startTime, endTime, opacity } = this.props;
    
    const startYear = startTime.getFullYear();
    const endYear = endTime.getFullYear();
    let shaderProps = [];
    for (var index = startYear; index <= endYear; index++) {
      shaderProps.push({
        key: index,
        timeRange: new TimeRange(
          moment(index.toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime(),
          moment((index + 1).toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime()),
        style: {
          fillOpacity: (index % 2) === 0 ? opacity : 0
        }
      });
    }

    return ( 
      <g>
        {shaderProps.map(({key, timeRange, style}) => {
          return this.renderBrush(key, timeRange, style);
        })}
      </g>
    );
  }
}

export default YearlyShader;
