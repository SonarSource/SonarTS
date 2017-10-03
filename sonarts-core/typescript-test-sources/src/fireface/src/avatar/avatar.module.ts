import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {FlexLayoutModule} from "@angular/flex-layout";

import {AvatarComponent} from "./avatar.component";

@NgModule({
    declarations: [
        AvatarComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule.forRoot(),
        FlexLayoutModule.forRoot()
    ],
    exports: [
        AvatarComponent
    ],
    providers: []
})

export class AvatarModule {}
