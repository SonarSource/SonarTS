//// [switchComparableCompatForBrands.ts]
class MyBrand
{
    private _a: number;
}

function test(strInput: string & MyBrand) {
    switch(strInput)
    {
        case "a":
        return 1;
    }
    return 0;
}


//// [switchComparableCompatForBrands.js]
var MyBrand = (function () {
    function MyBrand() {
    }
    return MyBrand;
}());
function test(strInput) {
    switch (strInput) {
        case "a":
            return 1;
    }
    return 0;
}
