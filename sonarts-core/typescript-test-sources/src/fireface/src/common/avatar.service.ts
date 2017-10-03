import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable} from '@angular/core';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {AuthService} from '../auth/auth.service';
import {IAvatar, Avatar} from './avatar.model';

@Injectable()
export class AvatarService {
    private _publicAvatars$: FirebaseListObservable<IAvatar[]>;
    private _userAvatars$: FirebaseListObservable<IAvatar[]>;

    private publicAvatarsPath;
    private userAvatarsPath;

    constructor(private af: AngularFire, auth: AuthService) {
        this.publicAvatarsPath = `/avatars`;
        this._publicAvatars$ = this.af.database.list(this.publicAvatarsPath, {
            query: {
                orderByChild: 'createdAt'
            }
        });

        this.userAvatarsPath = `/users/${auth.id}/avatars`;
        this._userAvatars$ = this.af.database.list(this.userAvatarsPath, {
            query: {
                orderByChild: 'createdAt'
            }
        });
    }


    get publicAvatars(): FirebaseListObservable<IAvatar[]> {
        return this._publicAvatars$;
    }

    get userAvatars(): FirebaseListObservable<IAvatar[]> {
        return this._userAvatars$;
    }

    /** PUBLIC EVENTS **/
    createPublicAvatar(avatar:Avatar): firebase.Promise<any> {
        return this._publicAvatars$.push(avatar);
    }
    getPublicAvatar(id: string): FirebaseObjectObservable<any> {
        return this.af.database.object(this.publicAvatarsPath+'/'+id);
    }
    removePublicAvatar(avatar: IAvatar): firebase.Promise<any> {
        return this._publicAvatars$.remove(avatar.$key);
    }
    updatePublicAvatar(avatar: IAvatar, changes: any): firebase.Promise<any> {
        return this._publicAvatars$.update(avatar.$key, changes);
    }

    /** USER-CENTRIC EVENTS **/
    createUserAvatar(avatar:Avatar): firebase.Promise<any> {
        return this._userAvatars$.push(avatar);
    }
    getUserAvatar(id: string): FirebaseObjectObservable<any> {
        return this.af.database.object(this.userAvatarsPath+'/'+id);
    }
    removeUserAvatar(avatar: IAvatar): firebase.Promise<any> {
        return this._userAvatars$.remove(avatar.$key);
    }
    updateUserAvatar(avatar: IAvatar, changes: any): firebase.Promise<any> {
        return this._userAvatars$.update(avatar.$key, changes);
    }
}
