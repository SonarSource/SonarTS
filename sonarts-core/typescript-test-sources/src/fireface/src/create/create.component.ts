import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MdIconRegistry} from '@angular/material';

import * as html2canvas from "html2canvas";
import 'rxjs/add/observable/throw';
import {Avatar} from "../common/avatar.model";
import {AssetService, IColor} from "../common/asset.service";
import {AvatarService} from "../common/avatar.service";
import {ActivatedRoute, Router, Params} from "@angular/router";
import {AuthService} from "../auth/auth.service";

import * as firebase from 'firebase';

@Component({
    selector: 'create-root',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit {

    currentAvatar: Avatar;

    @Input()
    selectedTabIndex: number;

    @Input()
    selectedGender: string;

    setsKeys: string[];
    intervalPromise: number|null;
    imageData: string;
    sets: any;
    colors: IColor[];

    constructor(iconRegistry: MdIconRegistry,
                private route: ActivatedRoute,
                private router: Router,
                private sanitizer: DomSanitizer,
                private authService: AuthService,
                private assetService: AssetService,
                private avatarService: AvatarService) {
        this.currentAvatar = new Avatar();

        this.colors = assetService.colors;
        this.sets = assetService.sets;
        this.setsKeys = assetService.assetKeys;

        this.selectedTabIndex = 0;
        this.selectedGender = this.currentAvatar.gender = "male";
        this.currentAvatar.color = this.colors[0].value;

        this.intervalPromise = null;
        this.imageData = "#";

        iconRegistry.addSvgIconSetInNamespace(
            'avatar',
            sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/avatar-icons.svg'));
    }

    ngOnInit() {
        //console.log('attempting to load avatar id', this.route.params);
        this.route.params
            .switchMap((params: Params) => this.avatarService.getPublicAvatar(params['id']))
            .subscribe((avatar: Avatar) => {
                if (typeof avatar.createdAt !== 'undefined') {
                    this.currentAvatar = avatar;
                } else {
                    // SETS random values
                    this.renderRandom();
                }
            });
    }

    setConfigValue(key:string, val:string|null) {
        this.currentAvatar[key] = val;

        this.updateImageData();
    }

    renderRandom(): void {
        this.currentAvatar.color = this.colors[this.randIndex(this.colors)].value;

        for (let k = 0; k < this.setsKeys.length; k++) {
            let key = this.setsKeys[k];
            this.addAssetRandom(key, this.sets[key][this.selectedGender]);
        }

        this.updateImageData();
    }

    updateImageData(): void {
        if (typeof html2canvas !== 'undefined') {
            let that = this;
            setTimeout(function () {
                html2canvas(document.getElementById('avatar'))
                    .then(function (canvas) {
                        (document.getElementById('save') as HTMLAnchorElement).href = that.imageData = canvas.toDataURL('image/png');
                    });
            }, 2000);
        }
    }

    uploadAvatar(): void {
        this.currentAvatar.author = this.authService.userInfo.uid;
        this.currentAvatar.name = this.authService.userInfo.displayName;
        this.currentAvatar.createdAt = firebase.database.ServerValue.TIMESTAMP;

        // For demo, upload all to public, user-specific, and Firebase storage
        this.avatarService.createPublicAvatar(this.currentAvatar);
        this.avatarService.createUserAvatar(this.currentAvatar);

        /*
        let randomName = this.randomString();
        let storage = firebase.storage();
        let storageRef = storage.ref();
        let userImagesRef = storageRef.child('users/'+this.authService.userInfo.uid+'/'+randomName);

        var image = new Image();
        image.name = randomName;
        image.src = this.imageData;
        let uploadTask = userImagesRef.put(this.imageData);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function (snapshot) {
                // Get task progress, including the number of bytes
                // uploaded and the total number of bytes to be uploaded
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.info('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.info('Upload is running');
                        break;
                }
            }, function (error) {
                // Upload failed
                console.error(error);
            }, function () {
                // Upload completed successfully
                console.log('Upload was successful');
            });
        */
    }

    addAssetRandom(key, list): void {
        this.currentAvatar[key] = list[this.randIndex(list)];
    }

    randIndex(list): number {
        return Math.floor(Math.random() * list.length);
    }

    autoShuffle(): void {
        if (this.intervalPromise) {
            clearInterval(this.intervalPromise);
            this.intervalPromise = null;
        } else {
            this.renderRandom();
            this.intervalPromise = setInterval(this.renderRandom, 2000);
        }
    }

    setSelectedGender(gender:string) {
        if (this.selectedGender != gender) {
            this.selectedGender = gender;
            this.currentAvatar.gender = gender;

            this.renderRandom();
        }
    }
    /**
     * RANDOM STRING GENERATOR
     *
     * Info:      http://stackoverflow.com/a/27872144/383904
     * Use:       randomString(length [,"A"] [,"N"] );
     * Default:   return a random alpha-numeric string
     * Arguments: If you use the optional "A", "N" flags:
     *            "A" (Alpha flag)   return random a-Z string
     *            "N" (Numeric flag) return random 0-9 string
     */
    private randomString(len?:number, an?:string) {
        if (typeof len === 'undefined') {
            len = 17;
        }

        an = an&&an.toLowerCase();
        let str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
        for(;i++<len;){
            let r = Math.random()*(max-min)+min <<0;
            str += String.fromCharCode(r+=r>9?r<36?55:61:48);
        }
        return str;
    }
}
