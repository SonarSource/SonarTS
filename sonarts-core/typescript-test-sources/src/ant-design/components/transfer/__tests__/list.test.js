import React from 'react';
import { render, mount } from 'enzyme';
import List from '../list';
import Checkbox from '../../checkbox';

const listCommonProps = {
  prefixCls: 'ant-transfer-list',
  dataSource: [{
    key: 'a',
    title: 'a',
  }, {
    key: 'b',
    title: 'b',
  }, {
    key: 'c',
    title: 'c',
    disabled: true,
  }],
  checkedKeys: ['a'],
  notFoundContent: 'Not Found',
  lazy: false,
};

describe('List', () => {
  it('should render correctly', () => {
    const wrapper = render(<List {...listCommonProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should check top Checkbox while all available items are checked', () => {
    const wrapper = mount(<List {...listCommonProps} checkedKeys={['a', 'b']} />);
    expect(wrapper.find('.ant-transfer-list-header').find(Checkbox).prop('checked'))
      .toBeTruthy();
  });
});
