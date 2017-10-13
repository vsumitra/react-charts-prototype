import React, { PureComponent } from 'react';
import { Brush } from 'esNet';
import { TimeRange } from 'pondjs';
import moment from 'moment';

class YearlyShader extends PureComponent {

  getShaderProps() {
    const { startTime, endTime, opacity } = this.props;
    
    const startYear = startTime.getFullYear();
    const endYear = endTime.getFullYear();
    let shaderProps = [];
    for (var index = startYear; index < endYear; index++) {
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
    return shaderProps;
  }

  renderBrush(key, timeRange, style) {
    return (<Brush key={key} timeRange={timeRange} style={style} />);
  }

  render() {
    return this.getShaderProps().map(({key, timeRange, style}) => {
      this.renderBrush(key, timeRange, style);
    });
  }
}

export default YearlyShader;
