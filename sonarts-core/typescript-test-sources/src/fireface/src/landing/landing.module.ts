import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {MaterialModule} from '@angular/material';
import {FlexLayoutModule} from "@angular/flex-layout";

import {LandingComponent} from './landing.component';
import {AvatarService} from '../common/avatar.service';
import {AvatarModule} from "../avatar/avatar.module";

const routes: Routes = [
    {path: '',   redirectTo: '/landing', pathMatch: 'full'},
    {path: 'landing', component: LandingComponent}
];

@NgModule({
    declarations: [
        LandingComponent
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

export class LandingModule {
}

export {AvatarService};
