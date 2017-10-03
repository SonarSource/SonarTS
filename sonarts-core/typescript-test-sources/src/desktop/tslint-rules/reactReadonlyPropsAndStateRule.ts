/**
 * react-readonly-props-and-state
 *
 * This custom tslint rule is highly specific to GitHub Desktop and attempts
 * to prevent props and state interfaces from being declared with mutable
 * members.
 *
 * While it's technically possible to modify this.props there's never a good
 * reason to do so and marking our interfaces as read only ensures that we
 * get compiler support for that fact.
 */

import * as ts from 'typescript'
import * as Lint from 'tslint'

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      if (sourceFile.languageVariant === ts.LanguageVariant.JSX) {
        return this.applyWithWalker(new ReactReadonlyPropsAndStateWalker(sourceFile, this.getOptions()))
      } else {
          return []
      }
    }
}

// The walker takes care of all the work.
class ReactReadonlyPropsAndStateWalker extends Lint.RuleWalker {
  protected visitInterfaceDeclaration(node: ts.InterfaceDeclaration): void {
      if (node.name.text.endsWith('Props')) {
        this.ensureReadOnly(node.members)
      }

      if (node.name.text.endsWith('State')) {
        this.ensureReadOnly(node.members)
      }

      super.visitInterfaceDeclaration(node)
  }

  private ensureReadOnly(members: ts.NodeArray<ts.TypeElement>) {
    members.forEach(member => {
      if (member.kind !== ts.SyntaxKind.PropertySignature) { return }

      const propertySignature = member as ts.PropertySignature

      if (!this.isReadOnly(propertySignature)) {
        const start = propertySignature.getStart()
        const width = propertySignature.getWidth()
        const error = `Property and state signatures should be read-only`

        this.addFailure(this.createFailure(start, width, error))
      }
    })
  }

  private isReadOnly(propertySignature: ts.PropertySignature): boolean {
    const modifiers = propertySignature.modifiers

    if (!modifiers) { return false }

    if (modifiers.find(m => m.kind === ts.SyntaxKind.ReadonlyKeyword)) {
      return true
    }

    return false
  }
}
