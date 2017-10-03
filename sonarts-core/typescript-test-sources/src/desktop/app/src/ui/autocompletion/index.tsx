import { AutocompletingTextInput } from './autocompleting-text-input'

export class AutocompletingTextArea extends AutocompletingTextInput<HTMLTextAreaElement> {
  protected getElementTagName(): 'textarea' | 'input' { return 'textarea' }
}
export class AutocompletingInput extends AutocompletingTextInput<HTMLInputElement> {
  protected getElementTagName(): 'textarea' | 'input' { return 'input' }
}

/** An interface which defines the protocol for an autocompletion provider. */
export interface IAutocompletionProvider<T> {

  /**
   * The type of auto completion provided this instance implements. Used
   * for variable width auto completion popups depending on type.
   */
  kind: 'emoji' | 'user' | 'issue'

  /**
   * Get the regex which it used to capture text for the provider. The text
   * captured in the first group will then be passed to `getAutocompletionItems`
   * to get autocompletions.
   *
   * The returned regex *must* be global.
   */
  getRegExp(): RegExp

  /**
   * Get the autocompletion results for the given text. The text is whatever was
   * captured in the first group by the regex returned from `getRegExp`.
   */
  getAutocompletionItems(text: string): Promise<ReadonlyArray<T>>

  /**
   * Render the autocompletion item. The item will be one which the provider
   * returned from `getAutocompletionItems`.
   */
  renderItem(item: T): JSX.Element

  /**
   * Returns a text representation of a given autocompletion results.
   * This is the text that will end up going into the textbox if the
   * user chooses to autocomplete a particular item.
   */
   getCompletionText(item: T): string
}

export * from './emoji-autocompletion-provider'
export * from './issues-autocompletion-provider'
export * from './user-autocompletion-provider'
