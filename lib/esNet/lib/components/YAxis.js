/**
 *  Copyright (c) 2015-present, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import 'd3-transition';
import merge from 'merge';
import React from 'react';
import ReactDOM from "react-dom"; // eslint-disable-line
import PropTypes from 'prop-types';
import { axisLeft, axisRight } from 'd3-axis';
import { easeSinOut } from 'd3-ease';
import { format } from 'd3-format';
import { select } from 'd3-selection';

import { scaleAsString } from '../js/util';

const MARGIN = 0;

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
 * The YAxis widget displays a vertical axis to the left or right
 * of the charts. A YAxis always appears within a `ChartRow`, from
 * which it gets its height and positioning. You can have more than
 * one axis per row.
 *
 * Here's a simple YAxis example:
 *
 * ```js
 * <YAxis
 *   id="price-axis"
 *   label="Price (USD)"
 *   min={0} max={100}
 *   width="60"
 *   type="linear"
 *   format="$,.2f"
 * />
 * ```
 *
 * Visually you can control the axis `label`, its size via the `width`
 * prop, its `format`, and `type` of scale (linear).
 *
 * Each axis also defines a scale through a `min` and `max` prop. Charts
 * may then refer to the axis by by citing the axis `id` in their `axis`
 * prop. Those charts will then use the axis scale for their y-scale.
 *
 * Here is an example of two line charts that each have their own axis:
 *
 * ```js
 * <ChartContainer timeRange={audSeries.timerange()}>
 *     <ChartRow height="200">
 *         <YAxis id="aud" label="AUD" min={0.5} max={1.5} width="60" format="$,.2f"/>
 *         <Charts>
 *             <LineChart axis="aud" series={audSeries} style={audStyle}/>
 *             <LineChart axis="euro" series={euroSeries} style={euroStyle}/>
 *         </Charts>
 *         <YAxis id="euro" label="Euro" min={0.5} max={1.5} width="80" format="$,.2f"/>
 *     </ChartRow>
 * </ChartContainer>
 * ```
 *
 *  Note that there are two `<YAxis>` components defined here, one before
 *  the `<Charts>` block and one after. This defines that the first axis will
 *  appear to the left of the charts and the second will appear after the charts.
 *  Each of the line charts uses its `axis` prop to identify the axis ("aud" or "euro")
 *  it will use for its vertical scale.
 */
export default class YAxis extends React.Component {
  componentDidMount() {
    this.renderAxis(
      this.props.align,
      this.props.scale,
      +this.props.width,
      this.props.absolute,
      this.props.format
    );
  }

  componentWillReceiveProps(nextProps) {
    
    const { scale, align, absolute, format, showGrid, chartWidth, type } = nextProps;

    if (
      scaleAsString(this.props.scale) !== scaleAsString(scale) ||
      this.props.type !== type ||
      this.props.chartWidth !== chartWidth
    ) {
      this.updateAxis(scale, align, absolute, format, showGrid, chartWidth);
    }
  }

  shouldComponentUpdate() {
        // eslint-disable-line
    return false;
  }

  getAxisGenerator() {
    let _scale = '';
    let axisGenerator;
    return (scale, align, absolute, fmt, showGrid, chartWidth) => {
      if (_scale !== scaleAsString(scale)) {
        _scale = scaleAsString(scale);

        const yformat = typeof fmt === 'function' ? fmt : format(fmt);

        const axis = align === 'left' ? axisLeft : axisRight;
        if (this.props.type === 'linear' || this.props.type === 'power') {
          if (this.props.height <= 200) {
            if (this.props.tickCount > 0) {
              axisGenerator = axis(scale)
                .ticks(this.props.tickCount)
                .tickFormat((d) => {
                  if (absolute) {
                    return yformat(Math.abs(d));
                  }
                  return yformat(d);
                })
                .tickSizeOuter(0);
            } else {
              axisGenerator = axis(scale)
                .ticks(5)
                .tickFormat((d) => {
                  if (absolute) {
                    return yformat(Math.abs(d));
                  }
                  return yformat(d);
                })
                .tickSizeOuter(0);
            }
          } else {
            axisGenerator = axis(scale)
              .ticks(5)
              .tickFormat((d) => {
                if (absolute) {
                  return yformat(Math.abs(d));
                }
                return yformat(d);
              })
              .tickSizeOuter(0);
          }
        } else if (this.props.type === 'log') {
          axisGenerator = axis().scale(scale).ticks(10, '.2s').tickSizeOuter(0);
        }
    
        if (showGrid) {
          axisGenerator.tickSizeInner(chartWidth);
        }
      }
      return axisGenerator;
    };
  }

  updateAxis(scale, align, absolute, format, showGrid, chartWidth) {
    const axisStyle = merge(
      true,
      defaultStyle.axis,
      this.props.style.axis ? this.props.style.axis : {}
    );
    const { axisColor } = axisStyle;

    //
    // Make an axis generator
    //

    const axisGenerator = this.getAxisGenerator()(scale, align, absolute, format, showGrid, chartWidth);

    const labelOffset = align === 'left'
      ? this.props.labelOffset - 50
      : 40 + this.props.labelOffset + (showGrid ? chartWidth : 0);

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('.yaxis')
      .transition()
      .duration(this.props.transition)
      .ease(easeSinOut)
      .call(axisGenerator);

    select(ReactDOM.findDOMNode(this))  // eslint-disable-line
      .select('.yaxis-label')
      .attr('y', labelOffset);

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .selectAll('.tick')
      .select('text')
      .style('fill', axisColor)    
      .style('stroke-width', .5)
      .style('stroke', 'none');

    select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .selectAll('.tick')
      .select('line')
      .style('stroke', axisColor);
      
    showGrid 
      ? select(ReactDOM.findDOMNode(this)) // eslint-disable-line
        .select('g')
        .select('path')
        .remove()
      : select(ReactDOM.findDOMNode(this)) // eslint-disable-line
        .select('g')
        .select('path')
        .style('fill', 'none')
        .style('stroke', axisColor);
  }

  renderAxis() {
    const { scale, align, absolute, format, showGrid, chartWidth, width, style, label } = this.props;
    const axisGenerator = this.getAxisGenerator()(scale, align, absolute, format, showGrid, chartWidth);

    // Remove the old axis from under this DOM node
    select(ReactDOM.findDOMNode(this)).selectAll("*").remove(); // eslint-disable-line
    // Add the new axis
    const x = align === 'left' ? width - MARGIN : 0;
    const labelOffset = align === 'left'
      ? this.props.labelOffset - 50
      : 40 + this.props.labelOffset + (showGrid ? chartWidth : 0);

    //
    // Style
    //

    const labelStyle = merge(
      true,
      defaultStyle.labels,
      style.labels ? style.labels : {}
    );
    const axisStyle = merge(
      true,
      defaultStyle.axis,
      style.axis ? style.axis : {}
    );
    const { axisColor } = axisStyle;
    const { labelColor, labelWeight, labelSize } = labelStyle;

    this.axis = select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .append('g')
      .attr('transform', `translate(${x},0)`)
      .style('stroke', 'none')
      .attr('class', 'yaxis')
      .style('fill', labelColor)
      .style('font-weight', labelWeight)
      .style('font-size', labelSize)
      .call(axisGenerator)
      .append('text')
      .attr('class', 'yaxis-label')
      .text(label)
      .attr('transform', ' rotate(-90)')
      .attr('y', labelOffset)
      .attr('x', -this.getMidpoint(scale))
      .attr('dy', '.5em')
      .attr('text-anchor', 'middle')
      .style('fill', style.labelColor)
      .style(
        'font-family',
        style.labelFont || '"Goudy Bookletter 1911", sans-serif"'
      )
      .style('font-weight', style.labelWeight || 100)
      .style(
        'font-size',
        style.labelSize ? `${style.width}px` : '12px'
      );

      select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .selectAll('.tick')
      .select('text')
      .style('fill', axisColor)
      .style('stroke-width', .5)
      .style('stroke', 'none');

      select(ReactDOM.findDOMNode(this)) // eslint-disable-line
      .select('g')
      .selectAll('.tick')
      .select('line')
      .style('stroke', axisColor);

    showGrid 
      ? select(ReactDOM.findDOMNode(this)) // eslint-disable-line
        .select('g')
        .select('path')
        .remove()
      : select(ReactDOM.findDOMNode(this)) // eslint-disable-line
        .select('g')
        .select('path')
        .style('fill', 'none')
        .style('stroke', axisColor);
  }

  getMidpoint(scale) {
    return (scale.range()[0] - scale.range()[1])/2;
  }

  render() {
    return <g />;
  }
}

YAxis.defaultProps = {
  id: 'yaxis', // id referred to by the chart
  align: 'left', // left or right of the chart
  min: 0, // range
  max: 1,
  type: 'linear', // linear, log, or power
  absolute: false, // Display scale always positive
  format: '.2s', // Format string for d3.format
  labelOffset: 0, // Offset the label position
  transition: 100, // Axis transition time
  width: 80,
  style: defaultStyle,
  showGrid: false,
  chartWidth: 0
};

YAxis.propTypes = {
  /**
   * A name for the axis which can be used by a chart to reference the axis.
   * This is used by the ChartRow to match charts to this axis.
   */
  id: PropTypes.string.isRequired, // eslint-disable-line
  /**
   * The label to be displayed alongside the axis.
   */
  label: PropTypes.string,
  /**
   * The scale type: linear, power, or log.
   */
  type: PropTypes.oneOf(['linear', 'power', 'log']),
  /**
   * Minium value, which combined with "max", define the scale of the axis.
   */
  min: PropTypes.number.isRequired, // eslint-disable-line
  /**
   * Maxium value, which combined with "min,"" define the scale of the axis.
   */
  max: PropTypes.number.isRequired, // eslint-disable-line
  /**
   * Render all ticks on the axis as positive values.
   */
  absolute: PropTypes.bool, // eslint-disable-line
  /**
   * Object specifying the available parameters by which the axis can be
   * styled. The object can contain: "labels" and "axis". Each of these
   * is an inline CSS style applied to the tick labels and axis lines
   * respectively.
   *
   * In addition the axis label itself can be styled with: "labelColor",
   * "labelFont", "labelWidth" and "labelSize".
   */
  style: PropTypes.shape({
    labels: PropTypes.object, // eslint-disable-line
    axis: PropTypes.object, // eslint-disable-line
    labelColor: PropTypes.string,
    labelFont: PropTypes.string,
    labelWeight: PropTypes.string,
    labelSize: PropTypes.string,
    width: PropTypes.number
  }),
  /**
   * The transition time for moving from one scale to another
   */
  transition: PropTypes.number,
  /**
   * The width of the axis
   */
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * Offset the axis label from its default position. This allows you to
   * fine tune the label location, which may be necessary depending on the
   * scale and how much room the tick labels take up. Maybe positive or
   * negative.
   */
  labelOffset: PropTypes.number,
  /**
   * d3.format for the axis labels. e.g. `format="$,.2f"`
   */
  format: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /**
   * If the chart should be rendered to with the axis on the left or right.
   * If you are using the axis in a ChartRow, you do not need to provide this.
   */
  align: PropTypes.string,
  /**
   * [Internal] The scale supplied by the ChartRow
   */
  scale: PropTypes.func,
  /**
   * [Internal] The height supplied by the surrounding ChartContainer
   */
  height: PropTypes.number,
  /**
   * The number of ticks
   */
  tickCount: PropTypes.number,
  /**
   * Show ticks as grids.
   */
  showGrid: PropTypes.bool,
  /**
   * chartWidth intternally set from ChartRow.
   */
  chartWidth: PropTypes.number,
};
