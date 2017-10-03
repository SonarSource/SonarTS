import {Injectable} from '@angular/core';
import * as _ from "lodash";
import {Avatar} from "./avatar.model";

export interface IColor {
    title: string,
    value: string
}

export interface IAssets {
    face,
    clothes,
    eyes,
    hair,
    facialhair,
    hat,
    neck,
    ears
}

@Injectable()
export class AssetService {

    private _genders = ["male", "female"];

    private _colors: IColor[] = [
        {
            title: "White",
            value: "#FFFFFF"
        },
        {
            title: "Pink",
            value: "#E67C73"
        },
        {
            title: "Pink",
            value: "#F06292"
        },
        {
            title: "Purple",
            value: "#BA68C8"
        },
        {
            title: "Purple",
            value: "#9575CD"
        },
        {
            title: "Blue",
            value: "#7986CB"
        },
        {
            title: "Blue",
            value: "#7BAAF7"
        },
        {
            title: "Blue",
            value: "#4FC3F7"
        },
        {
            title: "Teal",
            value: "#4DD0E1"
        },
        {
            title: "Teal",
            value: "#4DB6AC"
        },
        {
            title: "Green",
            value: "#57BB8A"
        },
        {
            title: "Green",
            value: "#AED581"
        },
        {
            title: "Green",
            value: "#DCE775"
        },
        {
            title: "Yellow",
            value: "#FFF176"
        },
        {
            title: "Yellow",
            value: "#F7CB4D"
        },
        {
            title: "",
            value: "#FFB74D"
        },
        {
            title: "Orange",
            value: "#FF8A65"
        },
        {
            title: "Brown",
            value: "#A1887F"
        },
        {
            title: "Gray",
            value: "#E0E0E0"
        },
        {
            title: "Gray",
            value: "#90A4AE"
        }
    ];
    private _assetColors: string[] = [];

    private _sets: any = {
        face: {
            title: "Face",
            female: [
                "ic_face-thin-01.svg",
                "ic_face-thin-02.svg",
                "ic_face-thin-03.svg",
                "ic_face-thin-04.svg",
                "ic_face-thin-05.svg",
                "ic_face-thin-06.svg",
                "ic_face-thin-07.svg",
                "ic_face-thin-08.svg",
                "ic_face-thin-09.svg",
                "ic_face-thin-10.svg",
                "ic_face-thin-11.svg",
                "ic_face-thin-12.svg"
            ],
            male: [
                "ic_face-wide-01.svg",
                "ic_face-wide-02.svg",
                "ic_face-wide-03.svg",
                "ic_face-wide-04.svg",
                "ic_face-wide-05.svg",
                "ic_face-wide-06.svg"
            ]
        },
        clothes: {
            title: "Clothes",
            female: [
                "ic_clothes-thin-01.svg",
                "ic_clothes-thin-02.svg",
                "ic_clothes-thin-03.svg",
                "ic_clothes-thin-04.svg",
                "ic_clothes-thin-05.svg",
                "ic_clothes-thin-06.svg",
                "ic_clothes-thin-07.svg",
                "ic_clothes-thin-08.svg",
                "ic_clothes-thin-09.svg"
            ],
            male: [
                "ic_clothes-wide-01.svg",
                "ic_clothes-wide-02.svg",
                "ic_clothes-wide-03.svg",
                "ic_clothes-wide-04.svg",
                "ic_clothes-wide-05.svg",
                "ic_clothes-wide-06.svg",
                "ic_clothes-wide-07.svg",
                "ic_clothes-wide-08.svg",
                "ic_clothes-wide-09.svg"
            ]
        },
        eyes: {
            title: "Eyes",
            female: [
                null,
                "ic_eyes-thin-01.svg",
                "ic_eyes-thin-02.svg",
                "ic_eyes-thin-03.svg",
                "ic_eyes-thin-04.svg",
                "ic_eyes-thin-05.svg",
                "ic_eyes-thin-06.svg"
            ],
            male: [
                null,
                "ic_eyes-wide-01.svg",
                "ic_eyes-wide-02.svg",
                "ic_eyes-wide-03.svg",
                "ic_eyes-wide-04.svg",
                "ic_eyes-wide-05.svg"
            ]
        },
        hair: {
            title: "Hair",
            female: [
                null,
                "ic_hair-thin-01.svg",
                "ic_hair-thin-02.svg",
                "ic_hair-thin-03.svg",
                "ic_hair-thin-04.svg",
                "ic_hair-thin-05.svg",
                "ic_hair-thin-06.svg",
                "ic_hair-thin-07.svg"
            ],
            male: [
                null,
                "ic_hair-wide-01.svg",
                "ic_hair-wide-02.svg",
                "ic_hair-wide-03.svg",
                "ic_hair-wide-04.svg",
                "ic_hair-wide-05.svg",
                "ic_hair-wide-06.svg",
                "ic_hair-wide-07.svg",
                "ic_hair-wide-08.svg",
                "ic_hair-wide-09.svg"
            ]
        },
        facialhair: {
            title: "Facial Hair",
            female: [
                null
            ],
            male: [
                null,
                "ic_facialhair-wide-01.svg",
                "ic_facialhair-wide-02.svg",
                "ic_facialhair-wide-03.svg",
                "ic_facialhair-wide-04.svg",
                "ic_facialhair-wide-05.svg"
            ]
        },
        hat: {
            title: "Hat",
            female: [
                null,
                "ic_hat-thin-01.svg",
                "ic_hat-thin-02.svg",
                "ic_hat-thin-03.svg",
                "ic_hat-thin-04.svg",
                "ic_hat-thin-05.svg"
            ],
            male: [
                null,
                "ic_hat-wide-01.svg",
                "ic_hat-wide-02.svg",
                "ic_hat-wide-03.svg",
                "ic_hat-wide-04.svg",
                "ic_hat-wide-05.svg"
            ]
        },
        neck: {
            title: "Neck",
            female: [
                null,
                "ic_neck-thin-01.svg",
                "ic_neck-thin-02.svg",
                "ic_neck-thin-03.svg",
                "ic_neck-thin-04.svg"
            ],
            male: [
                null,
                "ic_neck-wide-01.svg",
                "ic_neck-wide-02.svg"
            ]
        },
        ears: {
            title: "Ears",
            female: [
                null,
                "ic_ears-thin-01.svg",
                "ic_ears-thin-02.svg",
                "ic_ears-thin-03.svg",
                "ic_ears-thin-04.svg",
                "ic_ears-thin-05.svg"
            ],
            male: [
                null,
                "ic_ears-wide-01.svg",
                "ic_ears-wide-02.svg",
                "ic_ears-wide-03.svg"
            ]
        }
    };
    private _assetKeys: string[] = [];


    constructor() {
        this._assetColors = _.map(this._colors, (color) => {return color.value;});
        this._assetKeys = _.keys(this._sets);
    }

    getRandomAvatar(gender?:string): Avatar {
        if (typeof gender === 'undefined') {
            gender = this.genders[this.randIndex(this.genders)];
        }

        let randomAvatar = new Avatar();

        randomAvatar.color = this.colors[this.randIndex(this.colors)].value;

        for (let k = 0; k < this.assetKeys.length; k++) {
            let key = this.assetKeys[k];
            randomAvatar[key] = this.randomAsset(this.sets[key][gender]);
        }

        return randomAvatar;
    }

    private randomAsset(list): void {
        return list[this.randIndex(list)];
    }
    private randIndex(list): number {
        return Math.floor(Math.random() * list.length);
    }


    get genders(): (string|string)[] {
        return this._genders;
    }

    set genders(value: (string|string)[]) {
        this._genders = value;
    }

    get colors(): IColor[] {
        return this._colors;
    }

    set colors(value: IColor[]) {
        this._colors = value;
    }

    get sets(): any {
        return this._sets;
    }

    set sets(value: any) {
        this._sets = value;
    }

    get assetColors(): string[] {
        return this._assetColors;
    }

    set assetColors(value: string[]) {
        this._assetColors = value;
    }

    get assetKeys(): string[] {
        return this._assetKeys;
    }

    set assetKeys(value: string[]) {
        this._assetKeys = value;
    }
}
