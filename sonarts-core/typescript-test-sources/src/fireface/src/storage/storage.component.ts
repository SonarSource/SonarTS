import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

import {Observable} from 'rxjs';
import {AuthService} from "../auth/auth.service";

interface Image {
    $key?: string;
    downloadURL?: string;
    path: string;
    filename: string;
}

@Component({
    selector: 'image-upload',
    templateUrl: './storage.component.html',
    styleUrls: ['./storage.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UploadComponent {
    @Input() folder: string;

    fileList: FirebaseListObservable<Image[]>;
    imageList: Observable<Image[]>;

    files: FileList;
    image: string;

    constructor(public af: AngularFire, private auth: AuthService) {

    }

    ngOnInit() {

    }

    // VERSION 1
    ngOnChanges() {
        let storage = firebase.storage();

        this.fileList = this.af.database.list(`/${this.folder}/images`);
        console.log("Rendering all images in ", `/${this.folder}/images`);
        this.imageList = this.fileList.map(itemList =>
            itemList.map(item => {
                let pathReference = storage.ref(item.path);
                let result = {
                    $key: item.$key,
                    downloadURL: pathReference.getDownloadURL(),
                    path: item.path,
                    filename: item.filename
                };
                return result;
            })
        );
    }

    upload(): void {
        // Create a root reference
        let storageRef = firebase.storage().ref();

        let success = false;
        for (let selectedFile of [(<HTMLInputElement>document.getElementById('file-input')).files[0]]) {
            //console.log('selectedFile', selectedFile);

            let af = this.af;
            let folder = this.folder;
            let path = `/${this.folder}/${selectedFile.name}`;
            let iRef = storageRef.child(path);
            iRef.put(selectedFile).then((snapshot) => {
                console.log('Uploaded a blob or file! Now storing the reference at', `/${this.folder}/images/`);
                af.database.list(`/${folder}/images/`).push(
                    {
                        path: path,
                        filename: selectedFile.name
                    });
            });
        }
    }

    delete(image: Image): void {
        let storagePath = image.path;
        let referencePath = `${this.folder}/images/` + image.$key;

        // Do these as two separate steps so you can still try delete ref if file no longer exists

        // Delete from Storage
        firebase.storage().ref().child(storagePath).delete()
            .then(
                () => {
                },
                (error) => console.error("Error deleting stored file", storagePath)
            );

        // Delete references
        this.af.database.object(referencePath).remove();
    }

    // VERSION 2
    onFileChange(event): void {
        this.files = event.srcElement.files;
    }

    submit(): void {
        if (this.files.length > 0) {
            let fileForUpload = this.files[0];
            this.image = 'users/'+this.auth.id+'/'+fileForUpload.name;

            let storage = firebase.storage();
            let storageRef = storage.ref();
            let userImagesRef = storageRef.child(this.image);
            let uploadTask = userImagesRef.put(fileForUpload);

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

            this.clear();
        }
    }

    clear(): void {
        this.image = '';
        this.files = null;
    }
}
