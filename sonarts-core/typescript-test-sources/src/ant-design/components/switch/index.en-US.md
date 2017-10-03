---
category: Components
type: Data Entry
title: Switch
---

Switching Selector.

## When To Use

- If you need to represent the switching between two states or on-off state.
- The difference between `Switch` and `Checkbox` is that `Switch` will trigger a state change directly when you toggle it, while `Checkbox` is generally used for state marking, which should work in conjunction with submit operation.


## API

### Switch

Property | Description | Type | Default |
-----|-----|-----|------|
checked | determine whether the `Switch` is checked  | boolean | false |
defaultChecked | to set the initial state | boolean | false |
onChange | a callback function, can be executed when the checked state is changing | Function(checked:Boolean) | |
checkedChildren | content to be shown when the state is checked | string\|ReactNode  | |
unCheckedChildren | content to be shown when the state is unchecked | string\|ReactNode  | |
size | the size of the `Switch`, options: `default` `small` | string | default |
