import CalendarLocale from 'rc-calendar/lib/locale/zh_TW';
import TimePickerLocale from '../../time-picker/locale/zh_TW';
import assign from 'object-assign';

const locale = {
  lang: assign({
    placeholder: '請選擇日期',
    rangePlaceholder: ['開始日期', '結束日期'],
  }, CalendarLocale),
  timePickerLocale: assign({}, TimePickerLocale),
};

locale.lang.ok = '確 定';

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;
