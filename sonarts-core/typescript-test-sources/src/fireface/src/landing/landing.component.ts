import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import {Avatar} from "../common/avatar.model";
import {AssetService} from "../common/asset.service";


@Component({
    selector: 'landing-root',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LandingComponent implements OnInit {
    randomAvatar:Avatar;

    constructor(private assetService: AssetService) {
        this.randomAvatar = assetService.getRandomAvatar();
    }

    ngOnInit() {}
}
