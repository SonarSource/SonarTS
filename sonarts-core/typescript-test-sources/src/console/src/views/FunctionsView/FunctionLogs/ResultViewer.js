/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResultViewer
 *
 * Maintains an instance of CodeMirror for viewing a GraphQL response.
 *
 * Props:
 *
 *   - value: The text of the editor.
 *
 */
export class ResultViewer extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    editorTheme: PropTypes.string,
    editable: PropTypes.bool,
    onChange: PropTypes.function
  }

  componentDidMount() {
    // Lazily require to ensure requiring GraphiQL outside of a Browser context
    // does not produce an error.
    const CodeMirror = require('codemirror');
    require('codemirror/addon/fold/foldgutter');
    require('codemirror/addon/fold/brace-fold');
    require('codemirror/addon/dialog/dialog');
    require('codemirror/addon/search/search');
    require('codemirror/keymap/sublime');
    require('codemirror-graphql/results/mode');

    this.viewer = CodeMirror(this._node, {
      lineWrapping: true,
      value: this.props.value || '',
      readOnly: !this.props.editable,
      lineNumbers: this.props.editable,
      theme: this.props.editorTheme || 'graphiql',
      mode: 'graphql-results',
      keyMap: 'sublime',
      foldGutter: {
        minFoldSize: 4
      },
      gutters: this.props.editable ? [ 'CodeMirror-linenumbers', 'CodeMirror-foldgutter' ] : ['CodeMirror-foldgutter' ],
      extraKeys: {
        // Editor improvements
        'Ctrl-Left': 'goSubwordLeft',
        'Ctrl-Right': 'goSubwordRight',
        'Alt-Left': 'goGroupLeft',
        'Alt-Right': 'goGroupRight',
      }
    });

    this.viewer.on('change', this._onEdit);
  }

  componentDidUpdate(prevProps) {
    const CodeMirror = require('codemirror');

    // Ensure the changes caused by this update are not interpretted as
    // user-input changes which could otherwise result in an infinite
    // event loop.
    this.ignoreChangeEvent = true;
    if (this.props.schema !== prevProps.schema) {
      this.viewer.options.lint.schema = this.props.schema;
      this.viewer.options.hintOptions.schema = this.props.schema;
      this.viewer.options.info.schema = this.props.schema;
      this.viewer.options.jump.schema = this.props.schema;
      CodeMirror.signal(this.viewer, 'change', this.viewer);
    }
    if (this.props.value !== prevProps.value &&
      this.props.value !== this.cachedValue) {
      this.cachedValue = this.props.value;
      this.viewer.setValue(this.props.value);
    }
    this.ignoreChangeEvent = false;
  }
  _onEdit = () => {
    if (!this.ignoreChangeEvent) {
      this.cachedValue = this.viewer.getValue();
      if (this.props.onChange) {
        this.props.onChange(this.cachedValue);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.value !== nextProps.value;
  }

  componentWillUnmount() {
    this.viewer = null;
  }

  render() {
    return (
      <div
        className="result-window"
        ref={node => { this._node = node; }}
      />
    );
  }

  /**
   * Public API for retrieving the CodeMirror instance from this
   * React component.
   */
  getCodeMirror() {
    return this.viewer;
  }

  /**
   * Public API for retrieving the DOM client height for this component.
   */
  getClientHeight() {
    return this._node && this._node.clientHeight;
  }
}