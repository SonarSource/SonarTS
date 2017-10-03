import {Grid, GridParams} from "../grid";

export function initialiseAgGridWithAngular1(angular: any) {
    var angularModule = angular.module("agGrid", []);
    angularModule.directive("agGrid", function() {
        return {
            restrict: "A",
            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
            scope: true
        };
    });
}

function AngularDirectiveController($element: any, $scope: any, $compile: any, $attrs: any) {
    var gridOptions: any;
    var quickFilterOnScope: any;

    var keyOfGridInScope = $attrs.agGrid;
    quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
    gridOptions = $scope.$eval(keyOfGridInScope);
    if (!gridOptions) {
        console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
        return;
    }

    var eGridDiv = $element[0];
    var gridParams: GridParams = {
        $scope: $scope,
        $compile: $compile,
        quickFilterOnScope: quickFilterOnScope
    };
    var grid = new Grid(eGridDiv, gridOptions, gridParams);

    $scope.$on("$destroy", function() {
        grid.destroy();
    });
}
