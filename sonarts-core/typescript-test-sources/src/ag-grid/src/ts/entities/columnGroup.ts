import {ColumnGroupChild} from "./columnGroupChild";
import {ColGroupDef} from "./colDef";
import {Column} from "./column";
import {AbstractColDef} from "./colDef";
import {OriginalColumnGroup} from "./originalColumnGroup";
import {EventService} from "../eventService";
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class ColumnGroup implements ColumnGroupChild {

    public static HEADER_GROUP_SHOW_OPEN = 'open';
    public static HEADER_GROUP_SHOW_CLOSED = 'closed';

    public static EVENT_LEFT_CHANGED = 'leftChanged';
    public static EVENT_DISPLAYED_CHILDREN_CHANGED = 'leftChanged';

    // this is static, a it is used outside of this class
    public static createUniqueId(groupId: string, instanceId: number): string {
        return groupId + '_' + instanceId;
    }

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    // all the children of this group, regardless of whether they are opened or closed
    private children:ColumnGroupChild[];
    // depends on the open/closed state of the group, only displaying columns are stored here
    private displayedChildren:ColumnGroupChild[] = [];

    private groupId: string;
    private instanceId: number;
    private originalColumnGroup: OriginalColumnGroup;

    // private moving = false
    private left: number;
    private oldLeft: number;
    private localEventService: EventService = new EventService();

    private parent: ColumnGroupChild;

    constructor(originalColumnGroup: OriginalColumnGroup, groupId: string, instanceId: number) {
        this.groupId = groupId;
        this.instanceId = instanceId;
        this.originalColumnGroup = originalColumnGroup;
    }

    // as the user is adding and removing columns, the groups are recalculated.
    // this reset clears out all children, ready for children to be added again
    public reset(): void {
        this.parent = null;
        this.children = null;
        this.displayedChildren = null;
    }

    public getParent(): ColumnGroupChild {
        return this.parent;
    }

    public setParent(parent: ColumnGroupChild): void {
        this.parent = parent;
    }

    public getUniqueId(): string {
        return ColumnGroup.createUniqueId(this.groupId, this.instanceId);
    }

    public checkLeft(): void {
        // first get all children to setLeft, as it impacts our decision below
        this.displayedChildren.forEach( (child: ColumnGroupChild) => {
            if (child instanceof ColumnGroup) {
                (<ColumnGroup>child).checkLeft();
            }
        });

        // set our left based on first displayed column
        if (this.displayedChildren.length > 0) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                let lastChild = this.displayedChildren[this.displayedChildren.length-1];
                var lastChildLeft = lastChild.getLeft();
                this.setLeft(lastChildLeft);
            } else {
                var firstChildLeft = this.displayedChildren[0].getLeft();
                this.setLeft(firstChildLeft);
            }
        } else {
            // this should never happen, as if we have no displayed columns, then
            // this groups should not even exist.
            this.setLeft(null);
        }
    }

    public getLeft(): number {
        return this.left;
    }

    public getOldLeft(): number {
        return this.oldLeft;
    }

    public setLeft(left: number) {
        this.oldLeft = left;
        if (this.left !== left) {
            this.left = left;
            this.localEventService.dispatchEvent(ColumnGroup.EVENT_LEFT_CHANGED);
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }

    // public setMoving(moving: boolean) {
    //     this.getDisplayedLeafColumns().forEach( (column)=> column.setMoving(moving) );
    // }
    //
    // public isMoving(): boolean {
    //     return this.moving;
    // }

    public getGroupId(): string {
        return this.groupId;
    }

    public getInstanceId(): number {
        return this.instanceId;
    }

    public isChildInThisGroupDeepSearch(wantedChild: ColumnGroupChild): boolean {
        var result = false;

        this.children.forEach( (foundChild: ColumnGroupChild) => {
            if (wantedChild === foundChild) {
                result = true;
            }
            if (foundChild instanceof ColumnGroup) {
                if ((<ColumnGroup>foundChild).isChildInThisGroupDeepSearch(wantedChild)) {
                    result = true;
                }
            }
        });

        return result;
    }

    public getActualWidth(): number {
        var groupActualWidth = 0;
        if (this.displayedChildren) {
            this.displayedChildren.forEach( (child: ColumnGroupChild)=> {
                groupActualWidth += child.getActualWidth();
            });
        }
        return groupActualWidth;
    }

    public getMinWidth(): number {
        var result = 0;
        this.displayedChildren.forEach( (groupChild: ColumnGroupChild) => {
            result += groupChild.getMinWidth();
        });
        return result;
    }

    public addChild(child: ColumnGroupChild): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    public getDisplayedChildren(): ColumnGroupChild[] {
        return this.displayedChildren;
    }

    public getLeafColumns(): Column[] {
        var result: Column[] = [];
        this.addLeafColumns(result);
        return result;
    }

    public getDisplayedLeafColumns(): Column[] {
        var result: Column[] = [];
        this.addDisplayedLeafColumns(result);
        return result;
    }

    // why two methods here doing the same thing?
    public getDefinition(): AbstractColDef {
        return this.originalColumnGroup.getColGroupDef();
    }

    public getColGroupDef(): ColGroupDef {
        return this.originalColumnGroup.getColGroupDef();
    }

    public isPadding(): boolean {
        return this.originalColumnGroup.isPadding();
    }

    public isExpandable(): boolean {
        return this.originalColumnGroup.isExpandable();
    }

    public isExpanded(): boolean {
        return this.originalColumnGroup.isExpanded();
    }

    public setExpanded(expanded: boolean): void {
        this.originalColumnGroup.setExpanded(expanded);
    }

    private addDisplayedLeafColumns(leafColumns: Column[]): void {
        this.displayedChildren.forEach( (child: ColumnGroupChild) => {
            if (child instanceof Column) {
                leafColumns.push(<Column>child);
            } else if (child instanceof ColumnGroup) {
                (<ColumnGroup>child).addDisplayedLeafColumns(leafColumns);
            }
        });
    }

    private addLeafColumns(leafColumns: Column[]): void {
        this.children.forEach( (child: ColumnGroupChild) => {
            if (child instanceof Column) {
                leafColumns.push(<Column>child);
            } else if (child instanceof ColumnGroup) {
                (<ColumnGroup>child).addLeafColumns(leafColumns);
            }
        });
    }

    public getChildren(): ColumnGroupChild[] {
        return this.children;
    }

    public getColumnGroupShow(): string {
        return this.originalColumnGroup.getColumnGroupShow();
    }

    public getOriginalColumnGroup(): OriginalColumnGroup {
        return this.originalColumnGroup;
    }
    
    public calculateDisplayedColumns() {
        // clear out last time we calculated
        this.displayedChildren = [];
        // it not expandable, everything is visible
        if (!this.originalColumnGroup.isExpandable()) {
            this.displayedChildren = this.children;
        } else {
            // and calculate again
            this.children.forEach( abstractColumn => {
                var headerGroupShow = abstractColumn.getColumnGroupShow();
                switch (headerGroupShow) {
                    case ColumnGroup.HEADER_GROUP_SHOW_OPEN:
                        // when set to open, only show col if group is open
                        if (this.originalColumnGroup.isExpanded()) {
                            this.displayedChildren.push(abstractColumn);
                        }
                        break;
                    case ColumnGroup.HEADER_GROUP_SHOW_CLOSED:
                        // when set to open, only show col if group is open
                        if (!this.originalColumnGroup.isExpanded()) {
                            this.displayedChildren.push(abstractColumn);
                        }
                        break;
                    default:
                        // default is always show the column
                        this.displayedChildren.push(abstractColumn);
                        break;
                }
            });
        }

        this.localEventService.dispatchEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED);
    }
}
