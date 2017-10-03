import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {MaterialModule} from '@angular/material';
import 'hammerjs';
import {FlexLayoutModule} from "@angular/flex-layout";

import {AuthModule} from '../auth/auth.module';
import {FirebaseModule} from '../firebase/firebase.module';
import {CreateModule} from '../create/create.module';
import {GalleryModule} from '../gallery/gallery.module';
import {LandingModule} from '../landing/landing.module';
import {SignInModule} from '../sign-in/sign-in.module';

import {AppComponent} from './app.component';
import {AppHeaderComponent} from '../app-header/app-header.component';
import {AvatarModule} from "../avatar/avatar.module";

@NgModule({
    declarations: [
        AppComponent,
        AppHeaderComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot([], {useHash: false}),
        MaterialModule.forRoot(),
        FlexLayoutModule.forRoot(),

        AuthModule,
        FirebaseModule,

        AvatarModule,
        CreateModule,
        GalleryModule,
        LandingModule,
        SignInModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})

export class AppModule {}
