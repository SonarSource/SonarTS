import React from 'react';
import PropTypes from 'prop-types';
import TimePickerPanel from 'rc-time-picker/lib/Panel';
import classNames from 'classnames';
import warning from '../_util/warning';
import { getComponentLocale } from '../_util/getLocale';
declare const require: Function;

function getColumns({ showHour, showMinute, showSecond, use12Hours }) {
  let column = 0;
  if (showHour) {
    column += 1;
  }
  if (showMinute) {
    column += 1;
  }
  if (showSecond) {
    column += 1;
  }
  if (use12Hours) {
    column += 1;
  }
  return column;
}

export default function wrapPicker(Picker, defaultFormat?: string): any {
  return class PickerWrapper extends React.Component<any, any> {
    static contextTypes = {
      antLocale: PropTypes.object,
    };

    static defaultProps = {
      format: defaultFormat || 'YYYY-MM-DD',
      transitionName: 'slide-up',
      popupStyle: {},
      onChange() {
      },
      onOk() {
      },
      onOpenChange() {
      },
      locale: {},
      align: {
        offset: [0, -9],
      },
      prefixCls: 'ant-calendar',
      inputPrefixCls: 'ant-input',
    };

    handleOpenChange = (open) => {
      const { onOpenChange, toggleOpen } = this.props;
      onOpenChange(open);

      if (toggleOpen) {
        warning(
          false,
          '`toggleOpen` is deprecated and will be removed in the future, ' +
          'please use `onOpenChange` instead, see: http://u.ant.design/date-picker-on-open-change',
        );
        toggleOpen({ open });
      }
    }

    render() {
      const props = this.props;
      const { prefixCls, inputPrefixCls } = props;
      const pickerClass = classNames({
        [`${prefixCls}-picker`]: true,
      });
      const pickerInputClass = classNames({
        [`${prefixCls}-picker-input`]: true,
        [inputPrefixCls]: true,
        [`${inputPrefixCls}-lg`]: props.size === 'large',
        [`${inputPrefixCls}-sm`]: props.size === 'small',
      });

      const locale = getComponentLocale(
        props, this.context, 'DatePicker',
        () => require('./locale/zh_CN'),
      );

      const timeFormat = (props.showTime && props.showTime.format) || 'HH:mm:ss';
      const rcTimePickerProps = {
        format: timeFormat,
        showSecond: timeFormat.indexOf('ss') >= 0,
        showMinute: timeFormat.indexOf('mm') >= 0,
        showHour: timeFormat.indexOf('HH') >= 0,
        use12Hours: (props.showTime && props.showTime.use12Hours),
      };
      const columns = getColumns(rcTimePickerProps);
      const timePickerCls = `${prefixCls}-time-picker-column-${columns}`;
      const timePicker = props.showTime ? (
        <TimePickerPanel
          {...rcTimePickerProps}
          {...props.showTime}
          prefixCls={`${prefixCls}-time-picker`}
          className={timePickerCls}
          placeholder={locale.timePickerLocale.placeholder}
          transitionName="slide-up"
        />
      ) : null;

      return (
        <Picker
          {...props}
          pickerClass={pickerClass}
          pickerInputClass={pickerInputClass}
          locale={locale}
          timePicker={timePicker}
          onOpenChange={this.handleOpenChange}
        />
      );
    }
  };
}
