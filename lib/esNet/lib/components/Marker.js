import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFauxDOM } from 'react-faux-dom';

class Marker extends Component {
  constructor(props){
    super(props);
    this.renderLine = this.renderLine.bind(this);
  }

  renderLine(posx) {
    return (
      <line
        style={this.props.lineStyle}
        x1={posx}
        y1={5}
        x2={posx}
        y2={this.props.height}
      />
    );
  }

  renderLabel(posx) {
    return <text x={posx + 3} y={5} dy="1em" style={this.props.labelStyle}>{this.props.label}</text>;
  }

  componentDidUpdate() {
    this.renderLine();
  }

  componentDidMount() {
    this.renderLine();
  }

  render() {
    const posx = this.props.timeScale(this.props.time);
    if (posx) {
      return (
        <g>
          {!this.props.hide ? this.renderLine(posx) : null}
          {!this.props.hide && this.props.label ? this.renderLabel(posx) : null}
        </g>
      );
    }
    return null;
  }
}

export default withFauxDOM(Marker);

Marker.propTypes = {
  time: PropTypes.instanceOf(Date),
  /**
   * Show or hide marker.
   */
  hide: PropTypes.bool,
  /**
   * [Internal] The width supplied by the surrounding ChartContainer
   */
  width: PropTypes.number,
  /**
   * [Internal] The height supplied by the surrounding ChartContainer
   */
  height: PropTypes.number,
  /**
   * Simple label associate with the marker
   */
  label: PropTypes.string,
  /**
   * CSS line style.
   */
  lineStyle: PropTypes.object,
  /**
   * CSS label style.
   */
  labelStyle: PropTypes.object,
};

Marker.defaultProps = {
  hide: false,
  lineStyle: {
    stroke: '#999',
    cursor: 'none',
    pointerEvents: 'none'
  },
  labelStyle: { fontWeight: 100, fontSize: '12px' }
};