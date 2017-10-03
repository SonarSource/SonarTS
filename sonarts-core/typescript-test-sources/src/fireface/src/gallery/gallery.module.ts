import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {MaterialModule} from '@angular/material';
import {FlexLayoutModule} from "@angular/flex-layout";

import {AuthGuard} from '../auth/auth.module';

import {GalleryComponent} from './gallery.component';
import {AvatarService} from '../common/avatar.service';
import {AvatarModule} from "../avatar/avatar.module";

const routes: Routes = [
    {path: 'gallery', component: GalleryComponent, canActivate: [AuthGuard]}
];

@NgModule({
    declarations: [
        GalleryComponent
    ],
    imports: [
        AvatarModule,

        CommonModule,
        FormsModule,
        MaterialModule.forRoot(),
        FlexLayoutModule.forRoot(),
        RouterModule.forChild(routes)
    ],
    providers: [
        AvatarService
    ]
})

export class GalleryModule {
}

export {AvatarService};
