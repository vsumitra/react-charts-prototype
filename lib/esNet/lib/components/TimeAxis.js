/**
 *  Copyright (c) 2015-present, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import _ from 'underscore';
import merge from 'merge';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom'; // eslint-disable-line
import PropTypes from 'prop-types';
import { axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { timeDay, utcDay, timeMonth, utcMonth, timeYear, utcYear } from 'd3-time';
import { timeFormat } from 'd3-time-format';

import 'moment-duration-format';

function scaleAsString(scale) {
  return `${scale.domain().toString()}-${scale.range().toString()}`;
}

const defaultStyle = {
  labels: {
    labelColor: '#8B7E7E', // Default label color
    labelWeight: 100,
    labelSize: 11
  },
  axis: {
    axisColor: '#C0C0C0'
  }
};

/**
 * Renders a horizontal time axis. This is used internally by the ChartContainer
 * as a result of you specifying the timerange for the chart. Please see the API
 * docs for ChartContainer for more information.
 */
export default class TimeAxis extends React.Component {
  componentDidMount() {
    this.renderTimeAxis(this.props.scale, this.props.format);
  }

  componentWillReceiveProps(nextProps) {
    const { scale, utc, format } = nextProps;
    if (scaleAsString(this.props.scale) !== scaleAsString(scale) || this.props.utc !== utc) {
      this.renderTimeAxis(scale, format);
    }
  }

  // Force the component not to update because d3 will control the
  // DOM from this point down.
  shouldComponentUpdate() {
        // eslint-disable-line
    return false;
  }

  renderTimeAxis(scale, format) {
    let axis;

    const tickSize = this.props.showGrid ? -this.props.gridHeight : 5;
    const utc = this.props.utc;

    if (format === 'day') {
      axis = axisBottom(scale)
        .tickArguments([utc ? utcDay : timeDay, 1])
        .tickFormat(timeFormat('%d'))
        .tickSizeOuter(0);
    } else if (format === 'month') {
      axis = axisBottom(scale)
        .tickArguments([utc ? utcMonth : timeMonth, 1])
        .tickFormat(timeFormat('%B'))
        .tickSizeOuter(0);
    } else if (format === 'quarter') {
      axis = axisBottom(scale)
        .tickArguments([utc ? utcMonth : timeMonth, 3])
        .tickFormat((x) => {
          // get the milliseconds since Epoch for the date
          var milli = (x.getTime() - 10000);

          // calculate new date 10 seconds earlier. Could be one second, 
          // but I like a little buffer for my neuroses
          var vanilli = new Date(milli);

          // calculate the month (0-11) based on the new date
          var mon = vanilli.getMonth();
          var yr = vanilli.getFullYear();

          // return appropriate quarter for that month
          if ( mon <= 2 ) {
            return  'Q1 ' + yr;
          } else if ( mon <= 5 ) {
            return  'Q2 ' + yr;
          } else if ( mon <= 8 ) {
            return  'Q3 ' + yr;
          } else {
            return 'Q4 ' + yr;
          }
        })
        .tickSizeOuter(0);
    } else if (format === 'year') {
      axis = axisBottom(scale)
        .tickArguments([utc ? utcYear : timeYear, 1])
        .tickFormat(timeFormat('%Y'))
        .tickSizeOuter(0);
    } else if (format === 'relative') {
      axis = axisBottom(scale).tickFormat((d) => moment.duration(+d).format()).tickSizeOuter(0);
    } else if (_.isString(format)) {
      axis = axisBottom(scale).tickFormat(timeFormat(format)).tickSizeOuter(0);
    } else if (_.isFunction(format)) {
      axis = axisBottom(scale).tickFormat(format).tickSizeOuter(0);
    } else {
      axis = axisBottom(scale).tickSize(0);
    }

    // Style

    const labelStyle = merge(
      true,
      defaultStyle.labels,
      this.props.style.labels ? this.props.style.labels : {}
    );
    const axisStyle = merge(
      true,
      defaultStyle.axis,
      this.props.style.axis ? this.props.style.axis : {}
    );
    const { axisColor } = axisStyle;
    const { labelColor, labelWeight, labelSize } = labelStyle;

    // Remove the old axis from under this DOM node
    select(ReactDOM.findDOMNode(this)).selectAll('*').remove(); // eslint-disable-line
    
    //
    // Draw the new axis
    //
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .append('g')
      .attr('class', 'x axis')
      .attr( 'id', 'primary')
      .style('stroke', 'none')
      .style('fill', labelColor)
      .style('font-weight', labelWeight)
      .style('font-size', labelSize)
      .call(axis.tickSize(tickSize));

    // set the colors of the ticks.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .selectAll('.tick')
      .select('line')
      .style('stroke', axisColor)
      .style('stroke-width', 2);

    // set the labels color.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .selectAll('.tick')
      .select('text')
      .remove();
    
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .select('path')
      .remove();

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .append('g')
      .attr('class', 'x axis')
      .attr( 'id', 'compliment')
      .style('stroke', 'none')
      .style('fill', labelColor)
      .style('font-weight', labelWeight)
      .style('font-size', labelSize)
      .call(axis.tickSize(-tickSize));

    // set the colors of the ticks.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#compliment')
      .selectAll('.tick')
      .select('line')
      .style('stroke', axisColor)
      .style('stroke-width', 2);

    // set the labels color.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#compliment')
      .selectAll('.tick')
      .select('text')
      .remove();
    
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#compliment')
      .select('path')
      .remove();

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .append('g')
      .attr('class', 'x axis')
      .attr( 'id', 'secondary')
      .style('stroke', 'none')
      .style('fill', labelColor)
      .style('font-weight', labelWeight)
      .style('font-size', labelSize)
      .attr('transform', 'translate(' + this.intervalToPixels('year', scale) / 2 + ',5)' )
      .call(axis.tickSize(0));

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#secondary')
      .selectAll('.tick')
      .select('line')
      .remove();

    // set the labels color.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#secondary')
      .selectAll('.tick')
      .select('text')
      .style('fill', labelColor)
      .style('stroke', 'none');

    // remove the path element.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#secondary')
      .select('path')
      .remove();

    const quarterlyAxis = axisBottom(scale)
      .tickArguments([utc ? utcMonth : timeMonth, 3])
      .tickFormat((x) => {
        // get the milliseconds since Epoch for the date
        var milli = (x.getTime() - 10000);

        // calculate new date 10 seconds earlier. Could be one second, 
        // but I like a little buffer for my neuroses
        var vanilli = new Date(milli);

        // calculate the month (0-11) based on the new date
        var mon = vanilli.getMonth();
        var yr = vanilli.getFullYear();

        // return appropriate quarter for that month
        if ( mon <= 2 ) {
          return  'Q1 ' + yr;
        } else if ( mon <= 5 ) {
          return  'Q2 ' + yr;
        } else if ( mon <= 8 ) {
          return  'Q3 ' + yr;
        } else {
          return 'Q4 ' + yr;
        }
      })
      .tickSizeOuter(0);

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .append('g')
      .attr('class', 'x axis')
      .attr( 'id', 'minorTicks')
      .style('stroke', 'none')
      .style('fill', labelColor)
      .style('font-weight', labelWeight)
      .style('font-size', labelSize)
      .call(quarterlyAxis.tickSize(-tickSize));

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#minorTicks')
      .selectAll('.tick')
      .select('line')
      .style('stroke', axisColor);

    // set the labels color.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#minorTicks')
      .selectAll('.tick')
      .select('text')
      .style('fill', labelColor)
      .remove();

    // remove the path element.
    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('#minorTicks')
      .select('path')
      .remove();
  }

  intervalToPixels(type, scale) {
    var refTick = moment(scale.domain()[0]).startOf(type).toDate();
    var nextTick = moment(refTick).add(1, type).startOf(type).toDate();
    return scale(nextTick) - scale(refTick);
  }

  render() {
        // eslint-disable-line
    return <g />;
  }
}

TimeAxis.defaultProps = {
  showGrid: false,
  style: defaultStyle
};

TimeAxis.propTypes = {
  scale: PropTypes.func.isRequired,
  showGrid: PropTypes.bool,
  gridHeight: PropTypes.number,
  format: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  utc: PropTypes.bool,
  style: PropTypes.shape({
        labels: PropTypes.object, // eslint-disable-line
        axis: PropTypes.object // eslint-disable-line
  })
};
