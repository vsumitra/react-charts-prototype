import React, { Component } from 'react';

class ChartTooltip extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentWillReceiveProps(nextProps) {
    const{ color } = nextProps;
    
    if(this.instance) {
      this.setPseudoCss('before', 'border-top-color', color + ' !important');
    }
  }

  setPseudoCss(element, prop, value) {
    const UID = {
      _current: 0,
      getNew: function(){
        this._current++;
        return this._current;
      }
    };

    let sheetId = 'pseudo-style';
    let changed = false;
    let styles = {};
    let head = document.head || document.getElementsByTagName('head')[0];
    let sheet = document.getElementById(sheetId) || document.createElement('style');
    sheet.id = sheetId;

    var has_pseudo_class = ( this.instance.attributes['class'] && this.instance.attributes['class'].value.indexOf('pseudo-style') > -1 );

    if (!has_pseudo_class) {
      var className = 'pseudo-style' + UID.getNew();
      this.instance.className +=  ' '+className; 
    }

    if (!value.includes('undefined')) {
      let classes = this.instance.attributes['class'].value;
      // remove classes before
      className = classes.substr( classes.indexOf('pseudo-style') );
      // remove classes after
      className = classes.substr( classes.indexOf(' ')+1 );
      // add / update existing style...
      let selector = className +'::'+ element;

      var attributes = {};
      attributes[prop] = value;
      // fallback for the first time...
      if( !styles[ selector ] ) styles[ selector ] = {};
      // check if the styles have changed
      if( styles[ selector ] == attributes ){
      // do nothing...
      } else {
        styles[ selector ] = {...styles[ selector ], ...attributes};
        changed = true;
      }
    }

    // if the styles hasn't changed, save a cycle
    if( !changed ) return;

    // compile stylesheet
    var output = '';
    for( var target in styles ){
      var css = '';
      for( var key in styles[target] ){
        css += key +':'+ styles[target][key] +';';
      }
      output += ' .'+ target +' { '+ css +' }';
    }

    sheet.innerHTML = output;
    // append stylesheet
    head.appendChild(sheet);
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

    return (
      <div id='chart-tooltip'
        className='tooltip bs-tooltip-top'
        style={style}
      >
        <div id='chart-tooltip-arrow' style={{ position: 'absolute', display: 'block', height: 0 }} ref={(e) => this.instance = e}></div>
        {this.props.content}
      </div>
    );
  }
}

export default ChartTooltip;
