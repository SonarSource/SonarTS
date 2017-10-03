---
order: 6
title:
  zh-CN: 建议渲染父节点
  en-US: SuggestionContainer
---

## zh-CN

指定提示渲染的父节点。

## en-US

To set the container of the suggestion.

````jsx
import { Mention, Popover, Button } from 'antd';
const { toString, toContentState } = Mention;

function onChange(editorState) {
  console.log(toString(editorState));
}

function onSelect(suggestion) {
  console.log('onSelect', suggestion);
}

class PopoverContainer extends React.Component {
  getSuggestionContainer = () => {
    return this.popover.getPopupDomNode();
  }
  render() {
    const mention = (
      <Mention
        style={{ width: '100%', height: 100 }}
        onChange={onChange}
        defaultValue={toContentState('@afc163')}
        suggestions={['afc163', 'benjycui', 'yiminghe', 'RaoHai', '中文', 'にほんご']}
        onSelect={onSelect}
        getSuggestionContainer={this.getSuggestionContainer}
      />
    );
    return (
      <Popover trigger="click" content={mention} title="Title" ref={popover => this.popover = popover}>
        <Button type="primary">Click Me</Button>
      </Popover>
    );
  }
}

ReactDOM.render(<PopoverContainer />, mountNode);
````
