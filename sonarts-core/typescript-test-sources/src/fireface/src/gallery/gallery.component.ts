import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {FirebaseListObservable} from 'angularfire2';
import {IAvatar, Avatar} from '../common/avatar.model';
import {AvatarService} from '../common/avatar.service';

@Component({
    selector: 'gallery-root',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GalleryComponent implements OnInit {
    publicAvatars: IAvatar[] = [];
    userAvatars: IAvatar[];

    constructor(avatarService: AvatarService) {
        avatarService.publicAvatars.subscribe(queriedItems => {
            this.publicAvatars = queriedItems.reverse();
        });
        avatarService.userAvatars.subscribe(queriedItems => {
            this.userAvatars = queriedItems.reverse();
        });
    }

    ngOnInit() {}
}
