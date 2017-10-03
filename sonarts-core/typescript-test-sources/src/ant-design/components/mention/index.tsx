import React from 'react';
import RcMention, { Nav, toString, toEditorState, getMentions } from 'rc-editor-mention';
import classNames from 'classnames';
import shallowequal from 'shallowequal';
import Icon from '../icon';

export interface MentionProps {
  prefixCls: string;
  suggestionStyle?: React.CSSProperties;
  suggestions?: Array<any>;
  onSearchChange?: Function;
  onChange?: Function;
  notFoundContent?: any;
  loading?: Boolean;
  style?: React.CSSProperties;
  defaultValue?: any;
  value?: any;
  className?: string;
  multiLines?: Boolean;
  prefix?: string;
  placeholder?: string;
  getSuggestionContainer?: (triggerNode: Element) => HTMLElement;
  onFocus?: Function;
  onBlur?: Function;
  readOnly?: boolean;
  disabled?: boolean;
}

export interface MentionState {
  suggestions?: Array<any>;
  focus?: Boolean;
}

export default class Mention extends React.Component<MentionProps, MentionState> {
  static getMentions = getMentions;
  static defaultProps = {
    prefixCls: 'ant-mention',
    notFoundContent: '无匹配结果，轻敲空格完成输入',
    loading: false,
    multiLines: false,
  };
  static Nav = Nav;
  static toString = toString;
  static toContentState = toEditorState;
  static toEditorState = text => {
    console.warn('Mention.toEditorState is deprecated. Use toContentState instead.');
    return toEditorState(text);
  }
  constructor(props) {
    super(props);
    this.state = {
      suggestions: props.suggestions,
      focus: false,
    };
  }

  componentWillReceiveProps({ suggestions }) {
    if (!shallowequal(suggestions, this.props.suggestions)) {
      this.setState({
        suggestions,
      });
    }
  }

  onSearchChange = (value, prefix) => {
    if (this.props.onSearchChange) {
      return this.props.onSearchChange(value, prefix);
    }
    return this.defaultSearchChange(value);
  }

  onChange = (editorState) => {
    if (this.props.onChange) {
      this.props.onChange(editorState);
    }
  }

  defaultSearchChange(value: String): void {
    const searchValue = value.toLowerCase();
    const filteredSuggestions = (this.props.suggestions || []).filter(
      suggestion => suggestion.toLowerCase().indexOf(searchValue) !== -1,
    );
    this.setState({
      suggestions: filteredSuggestions,
    });
  }

  onFocus = (ev) => {
    this.setState({
      focus: true,
    });
    if (this.props.onFocus) {
      this.props.onFocus(ev);
    }
  }
  onBlur = (ev) => {
    this.setState({
      focus: false,
    });
    if (this.props.onBlur) {
      this.props.onBlur(ev);
    }
  }
  render() {
    const { className = '', prefixCls, loading } = this.props;
    const { suggestions, focus } = this.state;
    const cls = classNames(className, {
      [`${prefixCls}-active`]: focus,
    });

    const notFoundContent = loading
      ? <Icon type="loading" />
      : this.props.notFoundContent;

    return (
      <RcMention
        {...this.props}
        className={cls}
        onSearchChange={this.onSearchChange}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        suggestions={suggestions}
        notFoundContent={notFoundContent}
      />
    );
  }
}
