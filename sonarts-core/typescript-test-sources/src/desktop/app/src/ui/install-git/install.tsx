import * as React from 'react'

import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { openShell } from '../../lib/open-shell'
import { shell } from '../../lib/dispatcher/app-shell'

interface IInstallGitProps {
  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * The path to the current repository, in case the user wants to continue
   * doing whatever they're doing.
   */
  readonly path: string
}

/**
 * A dialog indicating that Git wasn't found, to direct the user to an
 * external resource for more information about setting up their environment.
 */
export class InstallGit extends React.Component<IInstallGitProps, void> {

  public constructor(props: IInstallGitProps) {
    super(props)
  }

  private onContinue = () => {
    openShell(this.props.path)
    this.props.onDismissed()
  }

  private onExternalLink = () => {
    const platform = __DARWIN__ ? 'mac' : 'windows'
    const url = `https://help.github.com/articles/set-up-git/#platform-${platform}`
    shell.openExternal(url)
  }

  public render() {
    return (
      <Dialog
        id='install-git'
        type='warning'
        title={__DARWIN__ ? 'Open in Terminal' : 'Open command prompt'}
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}>
        <DialogContent>
          <p>
            We were unable to locate Git on your system. This means you won't be able to execute any Git commands in the {__DARWIN__ ? 'Terminal window' : 'command prompt'}.
          </p>
          <p>
            To help you get Git installed and configured for your operating system, we have some external resources available.
          </p>
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type='submit' onClick={this.onContinue}>Open without Git</Button>
            <Button onClick={this.onExternalLink}>Install Git</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}
