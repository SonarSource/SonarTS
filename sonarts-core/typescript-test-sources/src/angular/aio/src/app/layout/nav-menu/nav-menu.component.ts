import { Component, Input } from '@angular/core';
import { CurrentNode, NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-nav-menu',
  template: `
  <aio-nav-item *ngFor="let node of filteredNodes" [node]="node" [selectedNodes]="currentNode.nodes">
  </aio-nav-item>`
})
export class NavMenuComponent {
  @Input() currentNode: CurrentNode;
  @Input() nodes: NavigationNode[] ;
  get filteredNodes() { return this.nodes ? this.nodes.filter(n => !n.hidden) : []; }
}
