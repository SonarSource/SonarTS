import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-header',
    styleUrls: ['app-header.component.scss'],
    templateUrl: 'app-header.component.html'
})

export class AppHeaderComponent {

    @Input() authenticated: boolean;
    @Input() userInfo: firebase.UserInfo;
    @Output() signOut = new EventEmitter(false);

    constructor() {

    }

    triggerSignOut(evt: Event): void {
        let msg:string = this.userInfo.displayName + ' signed out';
        this.signOut.emit(msg);
    }
}
