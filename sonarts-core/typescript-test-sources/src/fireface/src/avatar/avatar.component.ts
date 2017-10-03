import {Component, Input, OnInit, OnChanges, Output, ViewEncapsulation, EventEmitter} from '@angular/core';

import * as html2canvas from "html2canvas";
import 'rxjs/add/observable/throw';
import {Avatar} from "../common/avatar.model";
import {AssetService} from "../common/asset.service";

@Component({
    selector: 'avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AvatarComponent implements OnInit, OnChanges {

    @Input() model: Avatar;
    @Output() image: EventEmitter<any> = new EventEmitter();

    useCanvas: boolean;
    imageData: string;

    setsKeys: string[];
    intervalPromise: number|null;

    constructor(private assetService:AssetService) {
        this.setsKeys = this.assetService.assetKeys;

        this.useCanvas = false;
        this.intervalPromise = null;
        this.imageData = "#";
    }

    ngOnInit() {
        this.updateImageData();
    }

    ngOnChanges() {
        this.updateImageData();
    }

    updateImageData(): void {
        //console.log('state of avatar', this.model);

        if (this.useCanvas && typeof html2canvas !== 'undefined') {
            let that = this;
            setTimeout(function () {
                html2canvas(document.getElementById('avatar'))
                    .then(function (canvas) {
                        that.imageData = canvas.toDataURL('image/png');

                        that.image.emit(that.imageData);
                        //console.log('new image data', that.image);
                    });
            }, 2000);
        }
    }
}
