import {Bean, Autowired, Optional, PostConstruct, Context} from "./context/context";
import {IDateComp, IDateParams} from "./rendering/dateComponent";
import {GridOptions} from "./entities/gridOptions";
import {IComponent} from "./interfaces/iComponent";
import {ColDef, ColGroupDef} from "./entities/colDef";
import {HeaderGroupComp, IHeaderGroupComp, IHeaderGroupParams} from "./headerRendering/headerGroup/headerGroupComp";
import {HeaderComp, IHeaderComp, IHeaderParams} from "./headerRendering/header/headerComp";
import {DefaultDateComponent} from "./filter/dateFilter";
import {_} from "./utils";
import {
    InputTextFloatingFilterComp,
    IFloatingFilterParams,
    TextFloatingFilterComp,
    NumberFloatingFilterComp,
    DateFloatingFilterComp,
    SetFloatingFilterComp, IFloatingFilterComp, ReadModelAsStringFloatingFilterComp
} from "./filter/floatingFilter";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {
    IFloatingFilterWrapperParams, IFloatingFilterWrapperComp,
    FloatingFilterWrapperComp, EmptyFloatingFilterWrapperComp
} from "./filter/floatingFilterWrapper";
import {Column} from "./entities/column";
import {IFilterComp} from "./interfaces/iFilter";
import {FilterManager} from "./filter/filterManager";
import {BaseFilter} from "./filter/baseFilter";


export interface ComponentConfig {
    mandatoryMethodList:string[],
    optionalMethodList:string[],
    defaultComponent:{new(params:any): IComponent<any>}
}


/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface FrameworkComponentWrapper {
    wrap <A extends IComponent<any>> (frameworkComponent:{new(): any}, methodList:string[]):A
}

enum ComponentType {
    AG_GRID, FRAMEWORK
}

interface ComponentToUse<A extends IComponent<any> & B, B> {
    component:{new(): A}|{new(): B},
    type:ComponentType
}


@Bean('componentProvider')
export class ComponentProvider {
    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('filterManager')
    private filterManager: FilterManager;

    @Autowired("context")
    private context: Context;


    @Optional ("frameworkComponentWrapper")
    private frameworkComponentWrapper: FrameworkComponentWrapper;

    private allComponentConfig :{[key:string]:ComponentConfig}

    @PostConstruct
    public postContruct (){
        this.allComponentConfig = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: [],
                defaultComponent: DefaultDateComponent
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: HeaderComp
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: HeaderGroupComp
            },
            setFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: SetFloatingFilterComp
            },
            textFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: TextFloatingFilterComp
            },
            numberFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: NumberFloatingFilterComp
            },
            dateFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: DateFloatingFilterComp
            },
            readModelAsStringFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: ReadModelAsStringFloatingFilterComp
            },
            floatingFilterWrapperComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: FloatingFilterWrapperComp
            },
            emptyFloatingFilterWrapperComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: EmptyFloatingFilterWrapperComp
            },
            floatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: null
            },
            filterComponent:{
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: null
            }
        }
    }

    /**
     * This method returns the underlying representation of the component to be created. ie for Javascript the
     * underlying function where we should be calling new into. In case of the frameworks, the framework class
     * object that represents the component to be created.
     *
     * This method is handy if you want to check if a component has a particular method implemented withougt
     * having to create the method itself
     */
    private getComponentToUse<A extends IComponent<any> & B, B>
    (holder:GridOptions | ColDef | ColGroupDef, componentName:string, thisComponentConfig: ComponentConfig, mandatory:boolean = true):ComponentToUse<A, B>{
        let DefaultComponent : {new(): A} = <{new(): A}>thisComponentConfig.defaultComponent;
        let CustomAgGridComponent : {new(): A} = holder ? (<any>holder)[componentName] : null;
        let FrameworkComponentRaw : {new(): B} = holder ? (<any>holder)[componentName + "Framework"] : null;

        if (CustomAgGridComponent && FrameworkComponentRaw){
            throw Error("You are trying to register: " + componentName + " twice.")
        }

        if (FrameworkComponentRaw && !this.frameworkComponentWrapper){
            throw Error("You are specifying a framework component but you are not using a framework version of ag-grid for : " + componentName)
        }


        if (!FrameworkComponentRaw){
            let ComponentToUse:{new(): A}= CustomAgGridComponent || DefaultComponent;
            if (!ComponentToUse){
                if (mandatory){
                    throw Error ("Unexpected error loading default component for: " + componentName + " default component not found.");
                } else {
                    return null;
                }
            }
            return {
                type: ComponentType.AG_GRID,
                component: ComponentToUse
            }
        }

        return {
            type: ComponentType.FRAMEWORK,
            component: FrameworkComponentRaw
        }
    }

    private newAgGridComponent<A extends IComponent<any> & B, B>
    (holder:GridOptions | ColDef | ColGroupDef, componentName:string, defaultComponentName:string, mandatory:boolean = true): A{
        let thisComponentConfig: ComponentConfig= this.allComponentConfig[defaultComponentName];
        if (!thisComponentConfig){
            if (mandatory){
                throw Error(`Invalid component specified, there are no components of type : ${componentName} [${defaultComponentName}]`)
            }
            return null;
        }

        let componentToUse:ComponentToUse<A,B> = <ComponentToUse<A,B>>this.getComponentToUse(holder, componentName, thisComponentConfig, mandatory);

        if (!componentToUse) return null;

        if (componentToUse.type === ComponentType.AG_GRID){
            return <any>new componentToUse.component();
        }

        //Using framework component
        let FrameworkComponentRaw: {new(): B} = componentToUse.component;
        return <A>this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList);
    }

    public createAgGridComponent<A extends IComponent<any>> (holder:GridOptions | ColDef | ColGroupDef, componentName:string, defaultComponentName:string, agGridParams:any, mandatory:boolean = true): A{
        let component: A = <A>this.newAgGridComponent(holder, componentName, defaultComponentName, mandatory);
        if (!component) return null;

        let finalParams = this.getParams(holder, componentName, agGridParams);

        this.context.wireBean(component);
        component.init(finalParams);
        return component;
    }

    private getParams(holder: GridOptions|ColDef|ColGroupDef, componentName: string, agGridParams: any) {
        let customParams: any = holder ? (<any>holder)[componentName + "Params"] : null;
        let finalParams: any = {};
        _.mergeDeep(finalParams, agGridParams);
        _.mergeDeep(finalParams, customParams);
        if (!finalParams.api){
            finalParams.api = this.gridOptions.api;
        }
        return finalParams;
    }

    public newDateComponent (params: IDateParams): IDateComp{
        return <IDateComp>this.createAgGridComponent(this.gridOptions, "dateComponent", "dateComponent", params);
    }

    public newHeaderComponent (params:IHeaderParams): IHeaderComp{
        return <IHeaderComp>this.createAgGridComponent(params.column.getColDef(), "headerComponent", "headerComponent", params);
    }

    public newHeaderGroupComponent (params:IHeaderGroupParams): IHeaderGroupComp{
        return <IHeaderGroupComp>this.createAgGridComponent(params.columnGroup.getColGroupDef(), "headerGroupComponent", "headerGroupComponent", params);
    }

    private newFloatingFilterComponent<M> (type:string, colDef:ColDef, params:IFloatingFilterParams<M, any>):IFloatingFilterComp<M, any, any>{
        let floatingFilterToInstantiate: string = type === 'custom' ? 'floatingFilterComponent' : type + "FloatingFilterComponent";
        return <IFloatingFilterComp<M, any, any>> this.createAgGridComponent(colDef, "floatingFilterComponent", floatingFilterToInstantiate, params, false);
    }

    private getFilterComponentPrototype<A extends IComponent<any> & B, B>
    (colDef: ColDef): ComponentToUse<A, B> {
        return <ComponentToUse<A, B>>this.getComponentToUse(colDef, "filterComponent", this.allComponentConfig['filterComponent'], false);
    }

    public newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>> (column:Column, params:IFloatingFilterParams<M, any>):IFloatingFilterWrapperComp<M, any, any, any>{
        let colDef = column.getColDef();

        if (colDef.suppressFilter){
            return this.newEmptyFloatingFilterWrapperComponent(column);
        }

        let floatingFilterType: string;

        if (typeof  colDef.filter === 'string') {
            floatingFilterType = colDef.filter;
        } else if (!colDef.filter){
            floatingFilterType= this.gridOptionsWrapper.isEnterprise() ? 'set' : 'text';
        } else {
            floatingFilterType= 'custom';
        }

        let floatingFilter:IFloatingFilterComp<M, any, P> = this.newFloatingFilterComponent(floatingFilterType, colDef, params);
        let floatingFilterWrapperComponentParams : IFloatingFilterWrapperParams <M, any, any> = <any>{
            column: column,
            floatingFilterComp: floatingFilter,
            suppressFilterButton: this.getParams(colDef, 'floatingFilterComponent', params).suppressFilterButton
        };

        if (!floatingFilter){
            let filterComponent:ComponentToUse<any, any> = this.getFilterComponentPrototype(colDef);

            if (filterComponent && !filterComponent.component.prototype.getModelAsString){
                return this.newEmptyFloatingFilterWrapperComponent(column);
            }

            let rawModelFn = params.currentParentModel;
            params.currentParentModel = ():M=>{
                let parent:IFilterComp = <any>this.filterManager.getFilterComponent(column);
                return <any>parent.getModelAsString(rawModelFn());
            };
            floatingFilterWrapperComponentParams.floatingFilterComp = this.newFloatingFilterComponent('readModelAsString', colDef, params);
        }


        return <IFloatingFilterWrapperComp<any, any, any, any>> this.createAgGridComponent(colDef, "floatingFilterWrapperComponent", "floatingFilterWrapperComponent", floatingFilterWrapperComponentParams);
    }

    private newEmptyFloatingFilterWrapperComponent(column:Column) {
        let floatingFilterWrapperComponentParams : IFloatingFilterWrapperParams <any, any, any> = <any>{
            column: column,
            floatingFilterComp: null
        };
        return <IFloatingFilterWrapperComp<any, any, any, any>> this.createAgGridComponent(column.getColDef(), "floatingFilterWrapperComponent", "emptyFloatingFilterWrapperComponent", floatingFilterWrapperComponentParams);
    }
}