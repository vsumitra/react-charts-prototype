import React, { PureComponent } from 'react';
import Radium from 'radium';

class ToggleOptions extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selection: this.props.default
    };

    this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
  }

  defaultStyles = {
    width: '25px',
    height: '20px',
    fontSize: '12px',
    lineHeight: '.5',
    margin: '0px 2px',
    padding: '5px 0px',
    backgroundColor: '#f0f0f0',
    borderColor: '#f0f0f0',
    
    ':hover': {
      backgroundColor: '#e6e6e6',
      borderColor: '#e6e6e6'
    },

    ':active': {
      backgroundColor: '#aeaeae'
    }
  };

  getStyle(selected) {
    return selected
      ? { 
        backgroundColor: '#c4c4c4',
        borderColor: '#bbb',
        borderWidth: '2px',
        fontWeight: 'bold'
      }
      : { 
        backgroundColor: '#f0f0f0',
        borderColor: '#f0f0f0',
        borderWidth: '1px',
        fontWeight: 'normal'
      };
  }

  handleSelectionChanged = (e) => {
    this.setState({
      selection: e.target.value
    });
    if (this.props.valueChange) {
      this.props.valueChange(e.target.value);
    }
  };

  render() {
    const {list, styles, name} = this.props;

    return(
      <div style={{ display: 'inline-block' }}>
        {list.map((r, i) => {
          const selected = this.state.selection === r;
          return (
            <label 
              key={`toggle_option_${i}`} 
              className='btn'
              style={[
                this.defaultStyles,
                styles, 
                this.getStyle(selected)
              ]}>
              <input 
                id={`toggle_option_selection_${i}`} 
                type='radio' 
                name={name}
                value={r}
                style={{
                  position: 'absolute',
                  clip: 'rect(0,0,0,0)',
                  pointEvent: 'none'
                }} 
                onChange={(e) => this.handleSelectionChanged(e)}
                checked={selected} />{r}
            </label>);
        })}
      </div>
    );
  }
}

export default Radium(ToggleOptions);
