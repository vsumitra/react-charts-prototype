import React, { Component } from 'react';
import Picker from 'rc-calendar/lib/Picker';
import RangeCalendar from 'rc-calendar/lib/RangeCalendar';
import zhCN from 'rc-calendar/lib/locale/zh_CN';
import enUS from 'rc-calendar/lib/locale/en_US';
import TimePickerPanel from 'rc-time-picker/lib/Panel';
import 'rc-calendar/assets/index.css';
import 'rc-time-picker/assets/index.css';

import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';

class DateRangePicker extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      value: [],
      hoverValue: [],
    };

    this.cn = location.search.indexOf('cn') !== -1;

    this.now = moment();

    if (this.cn) {
      this.now.utcOffset(8);
    } else {
      this.now.utcOffset(0);
    }

    this.defaultCalendarValue = this.now.clone();
    this.defaultCalendarValue.add(-1, 'month');

    this.timePickerElement = (
      <TimePickerPanel
        defaultValue={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
      />
    );

    this.formatStr = 'YYYY-MM-DD HH:mm:ss';
  }

  newArray(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate(current) {
    const date = moment();
    date.hour(0);
    date.minute(0);
    date.second(0);
    return current.isBefore(date);  // can not select days before today
  }

  disabledTime(time, type) {
    console.log('disabledTime', time, type);
    if (type === 'start') {
      return {
        disabledHours() {
          const hours = this.newArray(0, 60);
          hours.splice(20, 4);
          return hours;
        },
        disabledMinutes(h) {
          if (h === 20) {
            return this.newArray(0, 31);
          } else if (h === 23) {
            return this.newArray(30, 60);
          }
          return [];
        },
        disabledSeconds() {
          return [55, 56];
        },
      };
    }
    return {
      disabledHours() {
        const hours = this.newArray(0, 60);
        hours.splice(2, 6);
        return hours;
      },
      disabledMinutes(h) {
        if (h === 20) {
          return this.newArray(0, 31);
        } else if (h === 23) {
          return this.newArray(30, 60);
        }
        return [];
      },
      disabledSeconds() {
        return [55, 56];
      },
    };
  }

  format(v) {
    return v ? v.format(this.formatStr) : '';
  }

  isValidRange(v) {
    return v && v[0] && v[1];
  }

  onChange(value) {
    console.log('onChange', value);
    this.setState({ value });
  }

  onHoverChange(hoverValue) {
    this.setState({ hoverValue });
  }

  render() {
    const state = this.state;
    const calendar = (
      <RangeCalendar
        hoverValue={state.hoverValue}
        onHoverChange={this.onHoverChange}
        showWeekNumber={false}
        dateInputPlaceholder={['start', 'end']}
        defaultValue={[this.now, this.now.clone().add(1, 'months')]}
        locale={this.cn ? zhCN : enUS}
        disabledTime={this.disabledTime}
        timePicker={this.timePickerElement}
      />
    );
    return (<Picker
      value={state.value}
      onChange={this.onChange}
      animation="slide-up"
      calendar={calendar}
    >
      {
        ({ value }) => {
          return (<span className={this.props.className} style={{ fontSize: '12px', margin: '3px 0px' }}>
            <input
              placeholder="please select"
              style={{ width: 200 }}
              disabled={state.disabled}
              readOnly
              className="ant-calendar-picker-input ant-input"
              value={this.isValidRange(value) && `${this.format(value[0])} - ${this.format(value[1])}` || ''}
            />
          </span>);
        }
      }
    </Picker>);
  }
}

export default DateRangePicker;
