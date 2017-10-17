import React from 'react';
import { Brush } from 'esNet';
import { TimeRange } from 'pondjs';
import moment from 'moment';

const YearlyShader = (props) => {
  const { startTime, endTime, opacity } = props;
    
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
        return (<Brush {...props} key={key} timeRange={timeRange} style={style} />);
      })}
    </g>
  );
};

export default YearlyShader;
