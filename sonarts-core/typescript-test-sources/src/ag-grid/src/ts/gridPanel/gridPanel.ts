import {Utils as _} from "../utils";
import {MasterSlaveService} from "../masterSlaveService";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {RowRenderer, RefreshViewParams} from "../rendering/rowRenderer";
import {FloatingRowModel} from "../rowModels/floatingRowModel";
import {BorderLayout} from "../layout/borderLayout";
import {Logger, LoggerFactory} from "../logger";
import {Bean, Qualifier, Autowired, PostConstruct, Optional, PreDestroy} from "../context/context";
import {EventService} from "../eventService";
import {Events} from "../events";
import {IRowModel} from "../interfaces/iRowModel";
import {DragService, DragListenerParams} from "../dragAndDrop/dragService";
import {IRangeController} from "../interfaces/iRangeController";
import {Constants, KeyboardBinding, KeyboardBindingGroup} from "../constants";
import {SelectionController} from "../selectionController";
import {CsvCreator} from "../csvCreator";
import {MouseEventService} from "./mouseEventService";
import {IClipboardService} from "../interfaces/iClipboardService";
import {FocusedCellController} from "../focusedCellController";
import {IContextMenuFactory} from "../interfaces/iContextMenuFactory";
import {RenderedRow} from "../rendering/renderedRow";
import {SetScrollsVisibleParams, ScrollVisibleService} from "./scrollVisibleService";
import {BeanStub} from "../context/beanStub";
import {IFrameworkFactory} from "../interfaces/iFrameworkFactory";
import {Column} from "../entities/column";
import {RowContainerComponent} from "../rendering/rowContainerComponent";
import {GridCell} from "../entities/gridCell";
import {RowNode} from "../entities/rowNode";
import {PaginationProxy} from "../rowModels/paginationProxy";

// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var gridHtml =
    '<div class="ag-root ag-font-style">'+
        // header
        '<div class="ag-header">'+
            '<div class="ag-pinned-left-header"></div>' +
            '<div class="ag-pinned-right-header"></div>' +
            '<div class="ag-header-viewport">' +
                '<div class="ag-header-container"></div>' +
            '</div>'+
            '<div class="ag-header-overlay"></div>' +
        '</div>'+
        // floating top
        '<div class="ag-floating-top">'+
            '<div class="ag-pinned-left-floating-top"></div>' +
            '<div class="ag-pinned-right-floating-top"></div>' +
            '<div class="ag-floating-top-viewport">' +
                '<div class="ag-floating-top-container"></div>' +
            '</div>'+
            '<div class="ag-floating-top-full-width-container"></div>'+
        '</div>'+
        // floating bottom
        '<div class="ag-floating-bottom">'+
            '<div class="ag-pinned-left-floating-bottom"></div>' +
            '<div class="ag-pinned-right-floating-bottom"></div>' +
            '<div class="ag-floating-bottom-viewport">' +
                '<div class="ag-floating-bottom-container"></div>' +
            '</div>'+
            '<div class="ag-floating-bottom-full-width-container"></div>'+
        '</div>'+
        // body
        '<div class="ag-body">'+
            '<div class="ag-pinned-left-cols-viewport">'+
                '<div class="ag-pinned-left-cols-container"></div>'+
            '</div>'+
            '<div class="ag-pinned-right-cols-viewport">'+
                '<div class="ag-pinned-right-cols-container"></div>'+
            '</div>'+
            '<div class="ag-body-viewport-wrapper">'+
                '<div class="ag-body-viewport">'+
                    '<div class="ag-body-container"></div>'+
                '</div>'+
            '</div>'+
            '<div class="ag-full-width-viewport">'+
                '<div class="ag-full-width-container"></div>'+
            '</div>'+
        '</div>'+
    '</div>';

var gridForPrintHtml =
        '<div class="ag-root ag-font-style">'+
            // header
            '<div class="ag-header-container"></div>'+
            // floating
            '<div class="ag-floating-top-container"></div>'+
            // body
            '<div class="ag-body-container"></div>'+
            // floating bottom
            '<div class="ag-floating-bottom-container"></div>'+
        '</div>';

// wrapping in outer div, and wrapper, is needed to center the loading icon
// The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
var mainOverlayTemplate =
    '<div class="ag-overlay-panel">'+
        '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>'+
    '</div>';

var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';

export interface RowContainerComponents {
    fullWidth: RowContainerComponent;
    body: RowContainerComponent;
    pinnedLeft: RowContainerComponent;
    pinnedRight: RowContainerComponent;
    floatingTop: RowContainerComponent;
    floatingTopPinnedLeft: RowContainerComponent;
    floatingTopPinnedRight: RowContainerComponent;
    floatingTopFullWidth: RowContainerComponent;
    floatingBottom: RowContainerComponent;
    floatingBottomPinnedLeft: RowContainerComponent;
    floatingBottomPinnedRight: RowContainerComponent;
    floatingBottomFullWith: RowContainerComponent;
}

@Bean('gridPanel')
export class GridPanel extends BeanStub {

    @Autowired('masterSlaveService') private masterSlaveService: MasterSlaveService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('csvCreator') private csvCreator: CsvCreator;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('$scope') private $scope: any;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;

    private layout: BorderLayout;
    private logger: Logger;

    private requestAnimationFrameExists = typeof requestAnimationFrame === 'function';
    private scrollLagCounter = 0;
    private scrollLagTicking = false;

    private eBodyViewport: HTMLElement;
    private eRoot: HTMLElement;
    private eBody: HTMLElement;

    private rowContainerComponents: RowContainerComponents;

    private eBodyContainer: HTMLElement;
    private ePinnedLeftColsContainer: HTMLElement;
    private ePinnedRightColsContainer: HTMLElement;
    private eFullWidthCellViewport: HTMLElement;
    private eFullWidthCellContainer: HTMLElement;
    private ePinnedLeftColsViewport: HTMLElement;
    private ePinnedRightColsViewport: HTMLElement;
    private eBodyViewportWrapper: HTMLElement;

    private eHeaderContainer: HTMLElement;
    private eHeaderOverlay: HTMLElement;
    private ePinnedLeftHeader: HTMLElement;
    private ePinnedRightHeader: HTMLElement;
    private eHeader: HTMLElement;
    private eHeaderViewport: HTMLElement;

    private eFloatingTop: HTMLElement;
    private ePinnedLeftFloatingTop: HTMLElement;
    private ePinnedRightFloatingTop: HTMLElement;
    private eFloatingTopContainer: HTMLElement;
    private eFloatingTopViewport: HTMLElement;
    private eFloatingTopFullWidthCellContainer: HTMLElement;

    private eFloatingBottom: HTMLElement;
    private ePinnedLeftFloatingBottom: HTMLElement;
    private ePinnedRightFloatingBottom: HTMLElement;
    private eFloatingBottomContainer: HTMLElement;
    private eFloatingBottomViewport: HTMLElement;
    private eFloatingBottomFullWidthCellContainer: HTMLElement;

    private eAllCellContainers: HTMLElement[];

    private lastLeftPosition = -1;
    private lastTopPosition = -1;

    private animationThreadCount = 0;
    private bodyHeight: number;

    // properties we use a lot, so keep reference
    private useScrollLag: boolean;
    private enableRtl: boolean;
    private forPrint: boolean;
    private scrollWidth: number;

    // used to track if pinned panels are showing, so we can turn them off if not
    private pinningRight: boolean;
    private pinningLeft: boolean;

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('GridPanel');
        // makes code below more readable if we pull 'forPrint' out
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        this.useScrollLag = this.isUseScrollLag();
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.loadTemplate();
        this.findElements();
    }

    public getVerticalPixelRange(): any {
        let container: HTMLElement = this.getPrimaryScrollViewport();
        let result = {
            top: container.scrollTop,
            bottom: container.scrollTop + container.offsetHeight
        };
        return result;
    }

    // we override this, as the base class is missing the annotation
    @PreDestroy
    public destroy() {
        super.destroy();
    }

    private onRowDataChanged(): void {
        this.showOrHideOverlay();
    }

    private showOrHideOverlay(): void {
        if (this.paginationProxy.isEmpty() && !this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.showNoRowsOverlay();
        } else {
            this.hideOverlay();
        }
    }

    public getLayout(): BorderLayout {
        return this.layout;
    }

    @PostConstruct
    private init() {

        this.addEventListeners();
        this.addDragListeners();

        this.layout = new BorderLayout({
            overlays: {
                loading: _.loadTemplate(this.createLoadingOverlayTemplate()),
                noRows: _.loadTemplate(this.createNoRowsOverlayTemplate())
            },
            center: this.eRoot,
            dontFill: this.forPrint,
            name: 'eGridPanel'
        });

        this.layout.addSizeChangeListener(this.setBodyAndHeaderHeights.bind(this));
        this.layout.addSizeChangeListener(this.setLeftAndRightBounds.bind(this));

        this.addScrollListener();

        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }

        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }

        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.disableBrowserDragging();
        this.addShortcutKeyListeners();
        this.addMouseEvents();
        this.addKeyboardEvents();
        this.addBodyViewportListener();
        this.addStopEditingWhenGridLosesFocus();

        if (this.$scope) {
            this.addAngularApplyCheck();
        }

        this.onDisplayedColumnsWidthChanged();
    }

    private addStopEditingWhenGridLosesFocus(): void {
        if (this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) {
            this.addDestroyableEventListener(this.eBody, 'focusout', (event: FocusEvent)=> {

                // this is the element the focus is moving to
                let elementWithFocus = event.relatedTarget;

                // see if the element the focus is going to is part of the grid
                let ourBodyFound = false;
                let pointer: any = elementWithFocus;
                while (_.exists(pointer)) {
                    pointer = pointer.parentNode;
                    if (pointer===this.eBody) {
                        ourBodyFound = true;
                    }
                }

                // if it is not part fo the grid, then we have lost focus
                if (!ourBodyFound) {
                    this.rowRenderer.stopEditing();
                }
            })
        }
    }

    private addAngularApplyCheck(): void {
        // this makes sure if we queue up requests, we only execute oe
        var applyTriggered = false;

        var listener = ()=> {
            // only need to do one apply at a time
            if (applyTriggered) { return; }
            applyTriggered = true; // mark 'need apply' to true
            setTimeout( ()=> {
                applyTriggered = false;
                this.$scope.$apply();
            }, 0);
        };

        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addDestroyableEventListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.eRoot.addEventListener('dragstart', (event: MouseEvent)=> {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    }

    private addEventListeners(): void {

        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FLOATING_ROW_DATA_CHANGED, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ITEMS_ADDED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ITEMS_REMOVED, this.onRowDataChanged.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
    }

    private addDragListeners(): void {
        if (this.forPrint // no range select when doing 'for print'
            || !this.gridOptionsWrapper.isEnableRangeSelection() // no range selection if no property
            || _.missing(this.rangeController)) { // no range selection if not enterprise version
            return;
        }

        var containers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
            this.eFloatingTop, this.eFloatingBottom];

        containers.forEach(container => {
            var params = <DragListenerParams> {
                dragStartPixels: 0,
                eElement: container,
                onDragStart: this.rangeController.onDragStart.bind(this.rangeController),
                onDragStop: this.rangeController.onDragStop.bind(this.rangeController),
                onDragging: this.rangeController.onDragging.bind(this.rangeController)
            };

            this.dragService.addDragSource(params);

            this.addDestroyFunc( ()=> this.dragService.removeDragSource(params) );
        });
    }

    private addMouseEvents(): void {
        var eventNames = ['click','mousedown','dblclick','contextmenu','mouseover','mouseout'];
        eventNames.forEach( eventName => {
            var listener = this.processMouseEvent.bind(this, eventName);
            this.eAllCellContainers.forEach( container => {
                container.addEventListener(eventName, listener);
                this.addDestroyFunc( ()=> container.removeEventListener(eventName, listener) );
            });
        });
    }

    private addKeyboardEvents(): void {
        var eventNames = ['keydown','keypress'];
        eventNames.forEach( eventName => {
            var listener = this.processKeyboardEvent.bind(this, eventName);
            this.eAllCellContainers.forEach( container => {
                this.addDestroyableEventListener(container, eventName, listener);
            });
        });
    }

    private addBodyViewportListener(): void {
        // we never add this when doing 'forPrint'
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows are displayed, or user simply clicks outside of a cell
        var listener = (mouseEvent: MouseEvent) => {
            var target = _.getTarget(mouseEvent);
            if (target===this.eBodyViewport) {
                // show it
                this.onContextMenu(mouseEvent);
                this.preventDefaultOnContextMenu(mouseEvent);
            }
        };

        this.addDestroyableEventListener(this.eBodyViewport, 'contextmenu', listener)
    }

    private getRowForEvent(event: MouseEvent | KeyboardEvent): RenderedRow {

        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var sourceElement = _.getTarget(event);

        while (sourceElement) {
            var domData = (<any>sourceElement)[domDataKey];
            if (domData && domData.renderedRow) {
                return <RenderedRow> domData.renderedRow;
            }
            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        let renderedCell = this.mouseEventService.getRenderedCellForEvent(keyboardEvent);

        if (!renderedCell) { return; }

        switch (eventName) {
            case 'keydown':
                let pageScrollingKeys: KeyboardBindingGroup[] = [
                    Constants.DIAGONAL_SCROLL_KEYS,
                    Constants.HORIZONTAL_SCROLL_KEYS,
                    Constants.VERTICAL_SCROLL_KEYS
                ];
                let result: TestKeyboardBindingGroupsResult = testKeyboardBindingGroups(pageScrollingKeys, keyboardEvent);

                if (result){
                    this.handlePageScrollingKey (result.trappedKeyboardBindingGroup.id, result.trappedKeyboardBinding.id, keyboardEvent);
                } else {
                    renderedCell.onKeyDown(keyboardEvent);
                }
                break;
            case 'keypress':
                renderedCell.onKeyPress(keyboardEvent);
                break;
        }
    }

    private handlePageScrollingKey (pagingKeyGroup:string, pagingKey:string, keyboardEvent:KeyboardEvent): void{
        switch (pagingKeyGroup){
            case Constants.DIAGONAL_SCROLL_KEYS_ID:
                this.pageDiagonally(pagingKey);
                break;
            case Constants.VERTICAL_SCROLL_KEYS_ID:
                this.pageVertically(pagingKey);
                break;
            case Constants.HORIZONTAL_SCROLL_KEYS_ID:
                this.pageHorizontally(pagingKey);
                break;
        }

        //***************************************************************************
        //Stop event defaults and propagation
        keyboardEvent.preventDefault();
    }

    //Either CTL LEFT/RIGHT
    private pageHorizontally (pagingKey:string): void{
        //***************************************************************************
        //column to select
        let allColumns: Column[] = this.columnController.getAllDisplayedColumns();
        let columnToSelect : Column = pagingKey === Constants.KEY_CTRL_LEFT_NAME ?
            allColumns[0]:
            allColumns[allColumns.length - 1];


        let horizontalScroll: HorizontalScroll = {
            type: ScrollType.HORIZONTAL,
            columnToScrollTo: columnToSelect,
            columnToFocus: columnToSelect
        };
        this.performScroll(horizontalScroll);
    }



    //Either HOME OR END
    private pageDiagonally (pagingKey:string): void{
        //***************************************************************************
        //where to place the newly selected cell cursor after the scroll
        let pageSize: number = this.getPrimaryScrollViewport().offsetHeight;
        let selectionTopDelta : number = pagingKey === Constants.KEY_PAGE_HOME_NAME ?
            0:
            pageSize;

        //***************************************************************************
        //where to scroll to
        let rowIndexToScrollTo = pagingKey === Constants.KEY_PAGE_HOME_NAME ?
            0:
            this.paginationProxy.getPageLastRow();
        let rowToScrollTo: RowNode = this.paginationProxy.getRow(rowIndexToScrollTo);


        //***************************************************************************
        //column to select
        let allColumns: Column[] = this.columnController.getAllDisplayedColumns();
        let columnToSelect : Column = pagingKey === Constants.KEY_PAGE_HOME_NAME ?
            allColumns[0]:
            allColumns[allColumns.length - 1];


        let diagonalScroll: DiagonalScroll = {
            focusedRowTopDelta: selectionTopDelta,
            type: ScrollType.DIAGONAL,
            rowToScrollTo: rowToScrollTo,
            columnToScrollTo: columnToSelect
        };
        this.performScroll(diagonalScroll);
    }

    //EITHER CTRL UP/DOWN or PAGE UP/DOWN
    private pageVertically (pagingKey:string): void{
        if (pagingKey === Constants.KEY_CTRL_UP_NAME){
            this.performScroll({
                rowToScrollTo: this.paginationProxy.getRow(0),
                focusedRowTopDelta: 0,
                type: ScrollType.VERTICAL
            } as VerticalScroll);
            return;
        }

        if (pagingKey === Constants.KEY_CTRL_DOWN_NAME){
            this.performScroll({
                rowToScrollTo: this.paginationProxy.getRow(this.paginationProxy.getPageLastRow()),
                focusedRowTopDelta: this.getPrimaryScrollViewport().offsetHeight,
                type: ScrollType.VERTICAL
            } as VerticalScroll);
            return;
        }

        //*********PAGING KEYS******************************************************


        //***************************************************************************
        //where to place the newly selected cell cursor after the scroll
        //  before we move the scroll
        //      a) find the top position of the current selected cell
        //      b) find what is the delta of that compared to the current scroll

        let focusedCell : GridCell = this.focusedCellController.getFocusedCell();
        let focusedRowNode = this.paginationProxy.getRow(focusedCell.rowIndex);
        let focusedAbsoluteTop = focusedRowNode.rowTop;
        let selectionTopDelta = (focusedAbsoluteTop - this.getPrimaryScrollViewport().scrollTop) - this.paginationProxy.getPixelOffset();


        //***************************************************************************
        //how much to scroll:
        //  a) One entire page from or to
        //  b) the top of the first row in the current view
        //  c) then find what is the row that would appear the first one in the screen and adjust it to its top pos
        //      this will avoid having half printed rows at the top

        let currentPageTopmostPixel = this.getPrimaryScrollViewport().scrollTop;
        let currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopmostPixel + this.paginationProxy.getPixelOffset());
        let currentPageTopmostRow = this.paginationProxy.getRow(currentPageTopRow);
        let viewportSize: number = this.getPrimaryScrollViewport().offsetHeight;
        let maxPageSize: number = this.paginationProxy.getCurrentPageHeight();
        let pageSize: number = maxPageSize < viewportSize ? maxPageSize : viewportSize;

        let currentTopmostRowBottom = currentPageTopmostRow.rowTop + currentPageTopmostRow.rowHeight;
        let toScrollUnadjusted = pagingKey == Constants.KEY_PAGE_DOWN_NAME ?
            pageSize + currentTopmostRowBottom :
            currentTopmostRowBottom - pageSize;

        let nextScreenTopmostRow = this.paginationProxy.getRow(this.paginationProxy.getRowIndexAtPixel(toScrollUnadjusted));

        let verticalScroll : VerticalScroll = {
            rowToScrollTo: nextScreenTopmostRow,
            focusedRowTopDelta: selectionTopDelta,
            type: ScrollType.VERTICAL
        };

        this.performScroll(verticalScroll);
    }

    // gets called by rowRenderer when new data loaded, as it will want to scroll
    // to the top
    public scrollToTop(): void {
        if (!this.forPrint) {
            this.getPrimaryScrollViewport().scrollTop = 0;
        }
    }

    //Performs any scroll
    private performScroll(scroll: Scroll) {
        let verticalScroll: VerticalScroll;
        let diagonalScroll: DiagonalScroll;
        let horizontalScroll: HorizontalScroll;

        let focusedCellBeforeScrolling : GridCell = this.focusedCellController.getFocusedCell();

        //***************************************************************************
        // Scroll screen
        let newScrollTop:number;
        switch (scroll.type){
            case ScrollType.VERTICAL:
                verticalScroll = <VerticalScroll> scroll;
                this.ensureIndexVisible(verticalScroll.rowToScrollTo.rowIndex);
                newScrollTop = verticalScroll.rowToScrollTo.rowTop - this.paginationProxy.getPixelOffset();
                this.getPrimaryScrollViewport().scrollTop = newScrollTop;
                break;
            case ScrollType.DIAGONAL:
                diagonalScroll = <DiagonalScroll> scroll;
                this.ensureIndexVisible(diagonalScroll.rowToScrollTo.rowIndex);
                newScrollTop = diagonalScroll.rowToScrollTo.rowTop - this.paginationProxy.getPixelOffset();
                this.getPrimaryScrollViewport().scrollTop = newScrollTop;
                this.getPrimaryScrollViewport().scrollLeft = diagonalScroll.columnToScrollTo.getLeft();
                break;
            case ScrollType.HORIZONTAL:
                horizontalScroll = <HorizontalScroll> scroll;
                this.getPrimaryScrollViewport().scrollLeft = horizontalScroll.columnToScrollTo.getLeft();
                break;
        }

        //***************************************************************************
        // This is needed so that when we try to focus on the cell is actually rendered.
        let refreshViewParams: RefreshViewParams = {
            onlyBody: true,
            suppressKeepFocus: true
        };
        this.rowRenderer.refreshView(refreshViewParams);


        //***************************************************************************
        // New focused cell
        let focusedRowIndex: number;
        let focusedColumn: Column;
        switch (scroll.type){
            case ScrollType.VERTICAL:
                focusedRowIndex = this.paginationProxy.getRowIndexAtPixel(newScrollTop + this.paginationProxy.getPixelOffset() + verticalScroll.focusedRowTopDelta);
                focusedColumn = focusedCellBeforeScrolling.column;
                break;
            case ScrollType.DIAGONAL:
                focusedRowIndex = this.paginationProxy.getRowIndexAtPixel(newScrollTop + this.paginationProxy.getPixelOffset() + diagonalScroll.focusedRowTopDelta);
                focusedColumn = diagonalScroll.columnToScrollTo;
                break;
            case ScrollType.HORIZONTAL:
                focusedRowIndex = focusedCellBeforeScrolling.rowIndex;
                focusedColumn = horizontalScroll.columnToScrollTo;
                break;
        }
        this.focusedCellController.setFocusedCell(
            focusedRowIndex,
            focusedColumn,
            null,
            true
        );
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        var renderedCell = this.mouseEventService.getRenderedCellForEvent(mouseEvent);
        if (renderedCell) {
            renderedCell.onMouseEvent(eventName, mouseEvent);
        }

        var renderedRow = this.getRowForEvent(mouseEvent);
        if (renderedRow) {
            renderedRow.onMouseEvent(eventName, mouseEvent);
        }

        this.preventDefaultOnContextMenu(mouseEvent);
    }

    private onContextMenu(mouseEvent: MouseEvent): void {

        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
                return;
            }
        }

        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            this.contextMenuFactory.showMenu(null, null, null, mouseEvent);
            mouseEvent.preventDefault();
        }
    }

    private preventDefaultOnContextMenu(mouseEvent: MouseEvent): void {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        if (this.gridOptionsWrapper.isSuppressMiddleClickScrolls() && mouseEvent.which === 2) {
            mouseEvent.preventDefault();
        }
    }

    private addShortcutKeyListeners(): void {
        this.eAllCellContainers.forEach( (container)=> {
            container.addEventListener('keydown', (event: KeyboardEvent)=> {

                // if the cell the event came from is editing, then we do not
                // want to do the default shortcut keys, otherwise the editor
                // (eg a text field) would not be able to do the normal cut/copy/paste
                let renderedCell = this.mouseEventService.getRenderedCellForEvent(event);
                if (renderedCell && renderedCell.isEditing()) {
                    return;
                }

                if (event.ctrlKey || event.metaKey) {
                    switch (event.which) {
                        case Constants.KEY_A: return this.onCtrlAndA(event);
                        case Constants.KEY_C: return this.onCtrlAndC(event);
                        case Constants.KEY_V: return this.onCtrlAndV(event);
                        case Constants.KEY_D: return this.onCtrlAndD(event);
                    }
                }
            });
        })
    }

    private onCtrlAndA(event: KeyboardEvent): boolean {
        if (this.rangeController && this.paginationProxy.isRowsToRender()) {
            var rowEnd: number;
            var floatingStart: string;
            var floatingEnd: string;

            if (this.floatingRowModel.isEmpty(Constants.FLOATING_TOP)) {
                floatingStart = null;
            } else {
                floatingStart = Constants.FLOATING_TOP;
            }

            if (this.floatingRowModel.isEmpty(Constants.FLOATING_BOTTOM)) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getTotalRowCount() - 1;
            } else {
                floatingEnd = Constants.FLOATING_BOTTOM;
                rowEnd = this.floatingRowModel.getFloatingBottomRowData().length = 1;
            }

            var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
            if (_.missingOrEmpty(allDisplayedColumns)) { return; }
            this.rangeController.setRange({
                rowStart: 0,
                floatingStart: floatingStart,
                rowEnd: rowEnd,
                floatingEnd: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: allDisplayedColumns[allDisplayedColumns.length-1]
            });
        }
        event.preventDefault();
        return false;
    }

    private onCtrlAndC(event: KeyboardEvent): boolean {
        if (!this.clipboardService) { return; }

        var focusedCell = this.focusedCellController.getFocusedCell();

        this.clipboardService.copyToClipboard();
        event.preventDefault();

        // the copy operation results in loosing focus on the cell,
        // because of the trickery the copy logic uses with a temporary
        // widget. so we set it back again.
        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.floating, true);
        }

        return false;
    }

    private onCtrlAndV(event: KeyboardEvent): boolean {
        if (!this.rangeController) { return; }

        this.clipboardService.pasteFromClipboard();
        return false;
    }

    private onCtrlAndD(event: KeyboardEvent): boolean {
        if (!this.clipboardService) { return; }
        this.clipboardService.copyRangeDown();
        event.preventDefault();
        return false;
    }

    private createOverlayTemplate(name: string, defaultTemplate: string, userProvidedTemplate: string): string {

        var template = mainOverlayTemplate
            .replace('[OVERLAY_NAME]', name);

        if (userProvidedTemplate) {
            template = template.replace('[OVERLAY_TEMPLATE]', userProvidedTemplate);
        } else {
            template = template.replace('[OVERLAY_TEMPLATE]', defaultTemplate);
        }

        return template;
    }

    private createLoadingOverlayTemplate(): string {

        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayLoadingTemplate();

        var templateNotLocalised = this.createOverlayTemplate(
            'loading',
            defaultLoadingOverlayTemplate,
            userProvidedTemplate);

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));

        return templateLocalised;
    }

    private createNoRowsOverlayTemplate(): string {
        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayNoRowsTemplate();

        var templateNotLocalised = this.createOverlayTemplate(
            'no-rows',
            defaultNoRowsOverlayTemplate,
            userProvidedTemplate);

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));

        return templateLocalised;
    }

    public ensureIndexVisible(index: any) {
        // if for print, everything is always visible
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        this.logger.log('ensureIndexVisible: ' + index);
        var rowCount = this.paginationProxy.getTotalRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }

        this.paginationProxy.goToPageWithIndex(index);

        var nodeAtIndex = this.paginationProxy.getRow(index);
        let pixelOffset = this.paginationProxy.getPixelOffset();
        var rowTopPixel = nodeAtIndex.rowTop - pixelOffset;
        var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;

        let vRange = this.getVerticalPixelRange();

        var vRangeTop = vRange.top;
        var vRangeBottom = vRange.bottom;

        var scrollShowing = this.isHorizontalScrollShowing();
        if (scrollShowing) {
            vRangeBottom -= this.scrollWidth;
        }

        var viewportScrolledPastRow = vRangeTop > rowTopPixel;
        var viewportScrolledBeforeRow = vRangeBottom < rowBottomPixel;

        let eViewportToScroll = this.getPrimaryScrollViewport();

        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eViewportToScroll.scrollTop = rowTopPixel;
            this.rowRenderer.drawVirtualRowsWithLock();
        } else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            let viewportHeight = vRangeBottom - vRangeTop;
            let newScrollPosition = rowBottomPixel - viewportHeight;
            eViewportToScroll.scrollTop = newScrollPosition;
            this.rowRenderer.drawVirtualRowsWithLock();
        }
        // otherwise, row is already in view, so do nothing
    }

    private getPrimaryScrollViewport(): HTMLElement {
        if (this.enableRtl && this.columnController.isPinningLeft()) {
            return this.ePinnedLeftColsViewport;
        } else if (!this.enableRtl && this.columnController.isPinningRight()) {
            return this.ePinnedRightColsViewport;
        } else {
            return this.eBodyViewport;
        }
    }

    // + moveColumnController
    public getCenterWidth(): number {
        return this.eBodyViewport.clientWidth;
    }

    private isHorizontalScrollShowing(): boolean {
        var result = _.isHorizontalScrollShowing(this.eBodyViewport);
        return result;
    }

    private isVerticalScrollShowing(): boolean {
        if (this.columnController.isPinningRight()) {
            return _.isVerticalScrollShowing(this.ePinnedRightColsViewport);
        } else {
            return _.isVerticalScrollShowing(this.eBodyViewport);
        }
    }

    private isBodyVerticalScrollShowing(): boolean {
        // if the scroll is on the pinned panel, then it is never in the center panel.
        // if LRT, then pinning right means scroll NOT on center
        if (!this.enableRtl && this.columnController.isPinningRight()) { return false; }
        // if RTL, then pinning left means scroll NOT on center
        if (this.enableRtl && this.columnController.isPinningLeft()) { return false; }

        return _.isVerticalScrollShowing(this.eBodyViewport);
    }

    // gets called every 500 ms. we use this to set padding on right pinned column
    public periodicallyCheck(): void {
        if (this.forPrint) { return; }
        this.setBottomPaddingOnPinnedRight();
        this.setMarginOnFullWidthCellContainer();
        this.setScrollShowing();
    }

    private setScrollShowing(): void {

        let params: SetScrollsVisibleParams = {
            vBody: false,
            hBody: false,
            vPinnedLeft: false,
            vPinnedRight: false
        };

        if (this.enableRtl) {
            if (this.columnController.isPinningLeft()) {
                params.vPinnedLeft = this.forPrint ? false : _.isVerticalScrollShowing(this.ePinnedLeftColsViewport);
            } else {
                params.vBody = _.isVerticalScrollShowing(this.eBodyViewport);
            }
        } else {
            if (this.columnController.isPinningRight()) {
                params.vPinnedRight = this.forPrint ? false : _.isVerticalScrollShowing(this.ePinnedRightColsViewport);
            } else {
                params.vBody = _.isVerticalScrollShowing(this.eBodyViewport);
            }
        }

        params.hBody = _.isHorizontalScrollShowing(this.eBodyViewport);

        this.scrollVisibleService.setScrollsVisible(params);
    }

    // the pinned container needs extra space at the bottom, some blank space, otherwise when
    // vertically scrolled all the way down, the last row will be hidden behind the scrolls.
    // this extra padding allows the last row to be lifted above the bottom scrollbar.
    private setBottomPaddingOnPinnedRight(): void {
        if (this.forPrint) { return; }

        if (this.columnController.isPinningRight()) {
            var bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
            if (bodyHorizontalScrollShowing) {
                this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
            } else {
                this.ePinnedRightColsContainer.style.marginBottom = '';
            }
        }
    }

    private setMarginOnFullWidthCellContainer(): void {
        if (this.forPrint) { return; }

        // if either right or bottom scrollbars are showing, we need to make sure the
        // fullWidthCell panel isn't covering the scrollbars. originally i tried to do this using
        // margin, but the overflow was not getting clipped and going into the margin,
        // so used border instead. dunno why it works, trial and error found the solution.
        if (this.enableRtl) {
            if (this.isVerticalScrollShowing()) {
                this.eFullWidthCellViewport.style.borderLeft = this.scrollWidth + 'px solid transparent';
            } else {
                this.eFullWidthCellViewport.style.borderLeft = '';
            }
        } else {
            if (this.isVerticalScrollShowing()) {
                this.eFullWidthCellViewport.style.borderRight = this.scrollWidth + 'px solid transparent';
            } else {
                this.eFullWidthCellViewport.style.borderRight = '';
            }
        }
        if (this.isHorizontalScrollShowing()) {
            this.eFullWidthCellViewport.style.borderBottom = this.scrollWidth + 'px solid transparent';
        } else {
            this.eFullWidthCellViewport.style.borderBottom = '';
        }
    }

    public ensureColumnVisible(key: any) {
        // if for print, everything is always visible
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        var column = this.columnController.getGridColumn(key);

        if (!column) { return; }

        if (column.isPinned()) {
            console.warn('calling ensureIndexVisible on a '+column.getPinned()+' pinned column doesn\'t make sense for column ' + column.getColId());
            return;
        }

        if (!this.columnController.isColumnDisplayed(column)) {
            console.warn('column is not currently visible');
            return;
        }

        var colLeftPixel = column.getLeft();
        var colRightPixel = colLeftPixel + column.getActualWidth();

        let viewportWidth = this.eBodyViewport.clientWidth;
        let scrollPosition = this.getBodyViewportScrollLeft();

        let bodyWidth = this.columnController.getBodyContainerWidth();

        let viewportLeftPixel: number;
        let viewportRightPixel: number;

        // the logic of working out left and right viewport px is both here and in the ColumnController,
        // need to refactor it out to one place
        if (this.enableRtl) {
            viewportLeftPixel = bodyWidth - scrollPosition - viewportWidth;
            viewportRightPixel = bodyWidth - scrollPosition;
        } else {
            viewportLeftPixel = scrollPosition;
            viewportRightPixel = viewportWidth + scrollPosition;
        }

        var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
        var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;

        if (viewportScrolledPastCol) {
            // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
            if (this.enableRtl) {
                let newScrollPosition = bodyWidth - viewportWidth - colLeftPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            } else {
                this.setBodyViewportScrollLeft(colLeftPixel);
            }
        } else if (viewportScrolledBeforeCol) {
            // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
            if (this.enableRtl) {
                let newScrollPosition = bodyWidth - colRightPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            } else {
                let newScrollPosition = colRightPixel - viewportWidth;
                this.setBodyViewportScrollLeft(newScrollPosition);
            }
        } else {
            // otherwise, col is already in view, so do nothing
        }

        // this will happen anyway, as the move will cause a 'scroll' event on the body, however
        // it is possible that the ensureColumnVisible method is called from within ag-Grid and
        // the caller will need to have the columns rendered to continue, which will be before
        // the event has been worked on (which is the case for cell navigation).
        this.setLeftAndRightBounds();
    }

    public showLoadingOverlay(): void {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.layout.showOverlay('loading');
        }
    }

    public showNoRowsOverlay(): void {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.layout.showOverlay('noRows');
        }
    }

    public hideOverlay(): void {
        this.layout.hideOverlay();
    }

    private getWidthForSizeColsToFit() {
        var availableWidth = this.eBody.clientWidth;
        // if pinning right, then the scroll bar can show, however for some reason
        // it overlays the grid and doesn't take space. so we are only interested
        // in the body scroll showing.
        var removeVerticalScrollWidth = this.isVerticalScrollShowing();
        if (removeVerticalScrollWidth) {
            availableWidth -= this.scrollWidth;
        }
        return availableWidth;
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(nextTimeout?: number) {
        var availableWidth = this.getWidthForSizeColsToFit();
        if (availableWidth>0) {
            this.columnController.sizeColumnsToFit(availableWidth);
        } else {
            if (nextTimeout===undefined) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(100);
                }, 0);
            } else if (nextTimeout===100) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(-1);
                }, 100);
            } else {
                console.log('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                    'zero width, maybe the grid is not visible yet on the screen?');
            }
        }
    }

    public getBodyContainer(): HTMLElement {
        return this.eBodyContainer;
    }

    public getDropTargetBodyContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
        } else {
            return [this.eBodyViewport, this.eFloatingTopViewport, this.eFloatingBottomViewport];
        }
    }

    public getBodyViewport() {
        return this.eBodyViewport;
    }

    public getDropTargetLeftContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [];
        } else {
            return [this.ePinnedLeftColsViewport, this.ePinnedLeftFloatingBottom, this.ePinnedLeftFloatingTop];
        }
    }

    public getDropTargetPinnedRightContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [];
        } else {
            return [this.ePinnedRightColsViewport, this.ePinnedRightFloatingBottom, this.ePinnedRightFloatingTop];
        }
    }

    public getHeaderContainer() {
        return this.eHeaderContainer;
    }

    public getHeaderOverlay() {
        return this.eHeaderOverlay;
    }

    public getRoot() {
        return this.eRoot;
    }

    public getPinnedLeftHeader() {
        return this.ePinnedLeftHeader;
    }

    public getPinnedRightHeader() {
        return this.ePinnedRightHeader;
    }

    private queryHtmlElement(selector: string): HTMLElement {
        return <HTMLElement> this.eRoot.querySelector(selector);
    }

    private loadTemplate(): void {
        // the template we use is different when doing 'for print'
        var template = this.forPrint ? gridForPrintHtml : gridHtml;
        this.eRoot = <HTMLElement> _.loadTemplate(template);

        // parts of the CSS need to know if we are in 'for print' mode or not,
        // so we add a class to allow applying CSS based on this.
        var scrollClass = this.forPrint ? 'ag-no-scrolls' : 'ag-scrolls';
        _.addCssClass(this.eRoot, scrollClass);
    }

    private findElements() {

        if (this.forPrint) {
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');

            this.eAllCellContainers = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];

            let containers = {
                body: new RowContainerComponent( {eContainer: this.eBodyContainer, useDocumentFragment: true} ),
                fullWidth: <RowContainerComponent> null,
                pinnedLeft: <RowContainerComponent> null,
                pinnedRight: <RowContainerComponent> null,

                floatingTop: new RowContainerComponent( {eContainer: this.eFloatingTopContainer} ),
                floatingTopPinnedLeft: <RowContainerComponent> null,
                floatingTopPinnedRight: <RowContainerComponent> null,
                floatingTopFullWidth: <RowContainerComponent> null,

                floatingBottom: new RowContainerComponent( {eContainer: this.eFloatingBottomContainer} ),
                floatingBottomPinnedLeft: <RowContainerComponent> null,
                floatingBottomPinnedRight: <RowContainerComponent> null,
                floatingBottomFullWith: <RowContainerComponent> null
            };
            this.rowContainerComponents = containers;

            // when doing forPrint, we don't have any fullWidth containers, instead we add directly to the main
            // containers. this works in forPrint only as there are no pinned columns (no need for fullWidth to
            // span pinned columns) and the rows are already the full width of the grid (the reason for fullWidth)
            containers.fullWidth = containers.body;
            containers.floatingBottomFullWith = containers.floatingBottom;
            containers.floatingTopFullWidth = containers.floatingTop;

        } else {
            this.eBody = this.queryHtmlElement('.ag-body');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
            this.eFullWidthCellContainer = this.queryHtmlElement('.ag-full-width-container');
            this.eFullWidthCellViewport = this.queryHtmlElement('.ag-full-width-viewport');
            this.ePinnedLeftColsContainer = this.queryHtmlElement('.ag-pinned-left-cols-container');
            this.ePinnedRightColsContainer = this.queryHtmlElement('.ag-pinned-right-cols-container');
            this.ePinnedLeftColsViewport = this.queryHtmlElement('.ag-pinned-left-cols-viewport');
            this.ePinnedRightColsViewport = this.queryHtmlElement('.ag-pinned-right-cols-viewport');
            this.ePinnedLeftHeader = this.queryHtmlElement('.ag-pinned-left-header');
            this.ePinnedRightHeader = this.queryHtmlElement('.ag-pinned-right-header');
            this.eHeader = this.queryHtmlElement('.ag-header');
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eHeaderOverlay = this.queryHtmlElement('.ag-header-overlay');
            this.eHeaderViewport = this.queryHtmlElement('.ag-header-viewport');

            this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
            this.ePinnedLeftFloatingTop = this.queryHtmlElement('.ag-pinned-left-floating-top');
            this.ePinnedRightFloatingTop = this.queryHtmlElement('.ag-pinned-right-floating-top');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingTopViewport = this.queryHtmlElement('.ag-floating-top-viewport');
            this.eFloatingTopFullWidthCellContainer = this.queryHtmlElement('.ag-floating-top-full-width-container');

            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eFloatingBottomViewport = this.queryHtmlElement('.ag-floating-bottom-viewport');
            this.eFloatingBottomFullWidthCellContainer = this.queryHtmlElement('.ag-floating-bottom-full-width-container');

            this.eAllCellContainers = [
                this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
                this.eFloatingTop, this.eFloatingBottom, this.eFullWidthCellContainer];

            this.rowContainerComponents = {
                body: new RowContainerComponent({eContainer: this.eBodyContainer, eViewport: this.eBodyViewport, useDocumentFragment: true}),
                fullWidth: new RowContainerComponent({eContainer: this.eFullWidthCellContainer, hideWhenNoChildren: true, eViewport: this.eFullWidthCellViewport}),
                pinnedLeft: new RowContainerComponent({eContainer: this.ePinnedLeftColsContainer, eViewport: this.ePinnedLeftColsViewport, useDocumentFragment: true}),
                pinnedRight: new RowContainerComponent({eContainer: this.ePinnedRightColsContainer, eViewport: this.ePinnedRightColsViewport, useDocumentFragment: true}),

                floatingTop: new RowContainerComponent({eContainer: this.eFloatingTopContainer}),
                floatingTopPinnedLeft: new RowContainerComponent({eContainer: this.ePinnedLeftFloatingTop}),
                floatingTopPinnedRight: new RowContainerComponent({eContainer: this.ePinnedRightFloatingTop}),
                floatingTopFullWidth: new RowContainerComponent({eContainer: this.eFloatingTopFullWidthCellContainer, hideWhenNoChildren: true}),

                floatingBottom: new RowContainerComponent({eContainer: this.eFloatingBottomContainer}),
                floatingBottomPinnedLeft: new RowContainerComponent({eContainer: this.ePinnedLeftFloatingBottom}),
                floatingBottomPinnedRight: new RowContainerComponent({eContainer: this.ePinnedRightFloatingBottom}),
                floatingBottomFullWith: new RowContainerComponent({eContainer: this.eFloatingBottomFullWidthCellContainer, hideWhenNoChildren: true}),
            };

            this.addMouseWheelEventListeners();
        }
    }

    public getRowContainers(): RowContainerComponents {
        return this.rowContainerComponents;
    }

    private addMouseWheelEventListeners(): void {

        // IE9, Chrome, Safari, Opera use 'mousewheel', Firefox uses 'DOMMouseScroll'

        this.addDestroyableEventListener(this.eBodyViewport, 'mousewheel', this.centerMouseWheelListener.bind(this));
        this.addDestroyableEventListener(this.eBodyViewport, 'DOMMouseScroll', this.centerMouseWheelListener.bind(this));

        if (this.enableRtl) {
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'mousewheel', this.genericMouseWheelListener.bind(this));
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'DOMMouseScroll', this.genericMouseWheelListener.bind(this));
        } else {
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'mousewheel', this.genericMouseWheelListener.bind(this));
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'DOMMouseScroll', this.genericMouseWheelListener.bind(this));
        }
    }

    public getHeaderViewport(): HTMLElement {
        return this.eHeaderViewport;
    }

    private centerMouseWheelListener(event: any): boolean {
        // we are only interested in mimicking the mouse wheel if we are not scrolling on the middle,
        // otherwise the body has scrolls and the mouse wheel works for free
        let bodyVScrollShowing = this.isBodyVerticalScrollActive();

        if (!bodyVScrollShowing) {
            let targetPanel = this.enableRtl ? this.ePinnedLeftColsViewport : this.ePinnedRightColsViewport;
            return this.generalMouseWheelListener(event, targetPanel);
        }
    }

    // used for listening to mouse wheel events on 1) left pinned and also the 2) fullWidthCell components.
    // the fullWidthCell listener is added in renderedRow, hence public.
    public genericMouseWheelListener(event: any): boolean {
        let targetPanel: HTMLElement;

        let bodyVScrollActive = this.isBodyVerticalScrollActive();
        if (bodyVScrollActive) {
            targetPanel = this.eBodyViewport;
        } else {
            targetPanel = this.enableRtl ? this.ePinnedLeftColsViewport : this.ePinnedRightColsViewport;
        }

        return this.generalMouseWheelListener(event, targetPanel);
    }

    private generalMouseWheelListener(event: any, targetPanel: HTMLElement): boolean {
        var wheelEvent = _.normalizeWheel(event);

        // we need to detect in which direction scroll is happening to allow trackpads scroll horizontally
        // horizontal scroll
        if (Math.abs(wheelEvent.pixelX) > Math.abs(wheelEvent.pixelY)) {
            var newLeftPosition = this.eBodyViewport.scrollLeft + wheelEvent.pixelX;
            this.eBodyViewport.scrollLeft = newLeftPosition;
        }
        // vertical scroll
        else {
            var newTopPosition = targetPanel.scrollTop + wheelEvent.pixelY;
            targetPanel.scrollTop = newTopPosition;
        }

        // allow the option to pass mouse wheel events to the browser
        // https://github.com/ceolter/ag-grid/issues/800
        // in the future, this should be tied in with 'forPrint' option, or have an option 'no vertical scrolls'
        if (!this.gridOptionsWrapper.isSuppressPreventDefaultOnMouseWheel()) {
            // if we don't prevent default, then the whole browser will scroll also as well as the grid
            event.preventDefault();
        }

        return false;
    }

    public onDisplayedColumnsChanged(): void {
        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.setLeftAndRightBounds();
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.setWidthsOfContainers();
        this.setLeftAndRightBounds();
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    }

    private onScrollVisibilityChanged(): void {
        this.setWidthsOfContainers();
    }

    private setWidthsOfContainers(): void {
        var mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = mainRowWidth;

        if (this.forPrint) {
            // pinned col doesn't exist when doing forPrint
            return;
        }

        this.eFloatingBottomContainer.style.width = mainRowWidth;
        this.eFloatingTopContainer.style.width = mainRowWidth;

        this.setPinnedLeftWidth();
        this.setPinnedRightWidth();
    }

    private setPinnedLeftWidth(): void {
        var pinnedLeftWidth = this.scrollVisibleService.getPinnedLeftWidth() + 'px';
        var pinnedLeftWidthWithScroll = this.scrollVisibleService.getPinnedLeftWithScrollWidth() + 'px';

        this.ePinnedLeftColsViewport.style.width = pinnedLeftWidthWithScroll;
        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidthWithScroll;

        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidthWithScroll;
        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidthWithScroll;

        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
    }

    private setPinnedRightWidth(): void {
        var pinnedRightWidth = this.scrollVisibleService.getPinnedRightWidth() + 'px';
        var pinnedRightWidthWithScroll = this.scrollVisibleService.getPinnedRightWithScrollWidth() + 'px';

        this.ePinnedRightColsViewport.style.width = pinnedRightWidthWithScroll;
        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidthWithScroll;

        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidthWithScroll;
        this.ePinnedRightFloatingTop.style.width = pinnedRightWidthWithScroll;

        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
    }

    private setPinnedContainersVisible() {
        // no need to do this if not using scrolls
        if (this.forPrint) {
            return;
        }

        let changeDetected = false;

        // if we are v scrolling, then one of these will have the scroll position.
        // we us this inside the if(changedDetected), so we don't always use it, however
        // it is changed when we make a pinned panel not visible, so we have to check it
        // before we change display on the pinned panels
        let scrollTop = Math.max(
            this.eBodyViewport.scrollTop,
            this.ePinnedLeftColsViewport.scrollTop,
            this.ePinnedRightColsViewport.scrollTop);

        let showLeftPinned = this.columnController.isPinningLeft();
        if (showLeftPinned !== this.pinningLeft) {
            this.pinningLeft = showLeftPinned;
            this.ePinnedLeftHeader.style.display = showLeftPinned ? 'inline-block' : 'none';
            this.ePinnedLeftColsViewport.style.display = showLeftPinned ? 'inline' : 'none';
            changeDetected = true;
        }

        let showRightPinned = this.columnController.isPinningRight();
        if (showRightPinned !== this.pinningRight) {
            this.pinningRight = showRightPinned;
            this.ePinnedRightHeader.style.display = showRightPinned ? 'inline-block' : 'none';
            this.ePinnedRightColsViewport.style.display = showRightPinned ? 'inline' : 'none';
            changeDetected = true;
        }

        if (changeDetected) {
            let bodyVScrollActive = this.isBodyVerticalScrollActive();
            this.eBodyViewport.style.overflowY = bodyVScrollActive ? 'auto' : 'hidden';

            // the body either uses it's scroll (when scrolling) or it's style.top
            // (when following the scroll of a pinned section), so we need to set it
            // back when changing from one to the other
            if (bodyVScrollActive) {
                this.eBodyContainer.style.top = '0px';
            } else {
                this.eBodyViewport.scrollTop = 0;
            }

            // when changing the primary scroll viewport, we copy over the scroll position,
            // eg if body was getting scrolled and we were at position 100px, then we start
            // pinning and pinned viewport is now the primary, we need to set it to 100px
            let primaryScrollViewport = this.getPrimaryScrollViewport();
            primaryScrollViewport.scrollTop = scrollTop;
            // this adjusts the scroll position of all the faking panels. they should already
            // be correct except body which has potentially just turned to be fake.
            this.fakeVerticalScroll(scrollTop);
        }

    }

    // init, layoutChanged, floatingDataChanged, headerHeightChanged
    public setBodyAndHeaderHeights(): void {
        if (this.forPrint) {
            // if doing 'for print', then the header and footers are laid
            // out naturally by the browser. it whatever size that's needed to fit.
            return;
        }

        var heightOfContainer = this.layout.getCentreHeight();
        if (!heightOfContainer) {
            return;
        }

        let headerRowCount = this.columnController.getHeaderRowCount();

        let totalHeaderHeight: number;
        let numberOfFloating = 0;
        let groupHeight:number;
        let headerHeight:number;
        if (!this.columnController.isPivotMode()){
            _.removeCssClass(this.eHeader, 'ag-pivot-on');
            _.addCssClass(this.eHeader, 'ag-pivot-off');
            if (this.gridOptionsWrapper.isFloatingFilter()){
                headerRowCount ++;
            }
            numberOfFloating = (this.gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }else{
            _.removeCssClass(this.eHeader, 'ag-pivot-off');
            _.addCssClass(this.eHeader, 'ag-pivot-on');
            numberOfFloating = 0;
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        let numberOfNonGroups = 1 + numberOfFloating;
        let numberOfGroups = headerRowCount - numberOfNonGroups;

        totalHeaderHeight = numberOfFloating * this.gridOptionsWrapper.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;

        this.eHeader.style['height'] = totalHeaderHeight + 'px';

        // padding top covers the header and the floating rows on top
        var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
        var paddingTop = totalHeaderHeight + floatingTopHeight;
        // bottom is just the bottom floating rows
        var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
        var floatingBottomTop = heightOfContainer - floatingBottomHeight;

        let bodyHeight = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;

        this.eBody.style.top = paddingTop + 'px';
        this.eBody.style.height = bodyHeight + 'px';

        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
        this.eFloatingTop.style.height = floatingTopHeight + 'px';
        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
        this.eFloatingBottom.style.top = floatingBottomTop + 'px';

        this.ePinnedLeftColsViewport.style.height = bodyHeight + 'px';
        this.ePinnedRightColsViewport.style.height = bodyHeight + 'px';

        // bodyHeight property is used by pagination service, that may change number of rows
        // in this page based on the height of the grid
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            this.eventService.dispatchEvent(Events.EVENT_BODY_HEIGHT_CHANGED);
        }
    }

    public getBodyHeight(): number {
        return this.bodyHeight;
    }

    public setHorizontalScrollPosition(hScrollPosition: number): void {
        this.eBodyViewport.scrollLeft = hScrollPosition;
    }

    // tries to scroll by pixels, but returns what the result actually was
    public scrollHorizontally(pixels: number): number {
        var oldScrollPosition = this.eBodyViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        var newScrollPosition = this.eBodyViewport.scrollLeft;
        return newScrollPosition - oldScrollPosition;
    }

    private addScrollListener() {
        // if printing, then no scrolling, so no point in listening for scroll events
        if (this.forPrint) {
            return;
        }

        let wrapWithDebounce = (func: Function)=> {
            if (this.useScrollLag) {
                return this.debounce.bind(this, func);
            } else {
                return func;
            }
        };

        var bodyScrollListener = wrapWithDebounce(this.onBodyScroll.bind(this));
        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', bodyScrollListener);

        // below we add two things:
        // pinnedScrollListener -> when pinned panel with scrollbar gets scrolled, it updates body and other pinned
        // suppressScroll -> stops scrolling when pinned panel was moved - which can only happen when user is navigating
        //     in the pinned container, as the pinned col should never scroll. so we rollback the scroll on the pinned.

        let onPinnedLeftVerticalScroll = this.onVerticalScroll.bind(this, this.ePinnedLeftColsViewport);
        let onPinnedRightVerticalScroll = this.onVerticalScroll.bind(this, this.ePinnedRightColsViewport);

        if (this.enableRtl) {
            let pinnedScrollListener = wrapWithDebounce(onPinnedLeftVerticalScroll);
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'scroll', pinnedScrollListener);

            let suppressRightScroll = () => this.ePinnedRightColsViewport.scrollTop = 0;
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'scroll', suppressRightScroll);
        } else {
            let pinnedScrollListener = wrapWithDebounce(onPinnedRightVerticalScroll);
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'scroll', pinnedScrollListener);

            let suppressLeftScroll = () => this.ePinnedLeftColsViewport.scrollTop = 0;
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'scroll', suppressLeftScroll);
        }

        let suppressCenterScroll = () => {
            if (this.getPrimaryScrollViewport()!==this.eBodyViewport) {
                this.eBodyViewport.scrollTop = 0;
            }
        };

        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', suppressCenterScroll);

        this.addIEPinFix(onPinnedRightVerticalScroll, onPinnedLeftVerticalScroll);
    }

    private onBodyScroll(): void {
        this.onBodyHorizontalScroll();
        this.onBodyVerticalScroll();
    }

    private onBodyHorizontalScroll(): void {
        var newLeftPosition = this.eBodyViewport.scrollLeft;
        if (newLeftPosition !== this.lastLeftPosition) {
            this.eventService.dispatchEvent(Events.EVENT_BODY_SCROLL, {direction: 'horizontal'});
            this.lastLeftPosition = newLeftPosition;
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
            this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
            this.setLeftAndRightBounds();
        }
    }

    private onBodyVerticalScroll(): void {
        let bodyVScrollActive = this.isBodyVerticalScrollActive();

        if (bodyVScrollActive) {
            this.onVerticalScroll(this.eBodyViewport);
        }
    }

    private onVerticalScroll(sourceElement: HTMLElement): void {
        var newTopPosition = sourceElement.scrollTop;
        if (newTopPosition !== this.lastTopPosition) {
            this.eventService.dispatchEvent(Events.EVENT_BODY_SCROLL, {direction: 'vertical'});
            this.lastTopPosition = newTopPosition;

            this.fakeVerticalScroll(newTopPosition);

            this.rowRenderer.drawVirtualRowsWithLock();
        }
    }

    // if LTR, we hide body scroll if pinning right (as scroll is in right pinned),
    // if RTL, we hide body scroll if pinning left (as scroll is in left pinned)
    private isBodyVerticalScrollActive(): boolean {
        let pinningRight = this.columnController.isPinningRight();
        let pinningLeft = this.columnController.isPinningLeft();
        let centerHasScroll = this.enableRtl ? !pinningLeft : !pinningRight;
        return centerHasScroll;
    }

    // this bit is a fix / hack for IE due to this:
    // https://www.ag-grid.com/forum/showthread.php?tid=4303
    // it gets the left panel to reposition itself after a model change
    private addIEPinFix(onPinnedRightScroll: Function, onPinnedLeftScroll: Function): void {
        var listener = () => {
            if (this.columnController.isPinningRight()) {
                setTimeout( ()=> {
                    if (this.enableRtl) {
                        onPinnedLeftScroll();
                    } else {
                        onPinnedRightScroll();
                    }
                }, 0);
            }
        };
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, listener);
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    private setLeftAndRightBounds(): void {
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        let scrollWidth = this.eBodyViewport.clientWidth;
        let scrollPosition = this.getBodyViewportScrollLeft();

        this.columnController.setVirtualViewportPosition(scrollWidth, scrollPosition);
    }

    private isUseScrollLag(): boolean {
        // if we are in IE or Safari, then we only redraw if there was no scroll event
        // in the 50ms following this scroll event. without this, these browsers have
        // a bad scrolling feel, where the redraws clog the scroll experience
        // (makes the scroll clunky and sticky). this method is like throttling
        // the scroll events.
        // let the user override scroll lag option
        if (this.gridOptionsWrapper.isSuppressScrollLag()) {
            return false;
        } else if (this.gridOptionsWrapper.getIsScrollLag()) {
            return this.gridOptionsWrapper.getIsScrollLag()();
        } else {
            return _.isBrowserIE() || _.isBrowserSafari();
        }
    }

    private debounce(callback: Function): void {
        if (this.requestAnimationFrameExists && _.isBrowserSafari()) {
            if (!this.scrollLagTicking) {
                this.scrollLagTicking = true;
                requestAnimationFrame( ()=> {
                    callback();
                    this.scrollLagTicking = false;
                });
            }
        } else {
            this.scrollLagCounter++;
            var scrollLagCounterCopy = this.scrollLagCounter;
            setTimeout( ()=> {
                if (this.scrollLagCounter === scrollLagCounterCopy) {
                    callback();
                }
            }, 50);
        }
    }

    public getBodyViewportScrollLeft(): number {
        if (this.forPrint) { return 0; }

        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return _.getScrollLeft(this.eBodyViewport, this.enableRtl);
    }

    public setBodyViewportScrollLeft(value: number): void {
        if (this.forPrint) { return; }

        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        _.setScrollLeft(this.eBodyViewport, value, this.enableRtl);
    }

    public horizontallyScrollHeaderCenterAndFloatingCenter(): void {
        let scrollLeft = this.getBodyViewportScrollLeft();
        let offset = this.enableRtl ? scrollLeft : -scrollLeft;

        this.eHeaderContainer.style.left = offset + 'px';
        this.eFloatingBottomContainer.style.left = offset + 'px';
        this.eFloatingTopContainer.style.left = offset + 'px';
    }

    // we say fake scroll as only one panel (left, right or body) has scrolls,
    // the other panels mimic the scroll by getting it's top position updated.
    private fakeVerticalScroll(position: number): void {
        if (this.enableRtl) {
            // RTL
            // if pinning left, then body scroll is faking
            let pinningLeft = this.columnController.isPinningLeft();
            if (pinningLeft) {
                this.eBodyContainer.style.top = -position + 'px';
            }
            // right is always faking
            this.ePinnedRightColsContainer.style.top = -position + 'px';
        } else {
            // LTR
            // if pinning right, then body scroll is faking
            let pinningRight = this.columnController.isPinningRight();
            if (pinningRight) {
                this.eBodyContainer.style.top = -position + 'px';
            }
            // left is always faking
            this.ePinnedLeftColsContainer.style.top = -position + 'px';
        }

        // always scroll fullWidth container, as this is never responsible for a scroll
        this.eFullWidthCellContainer.style.top = -position + 'px';
    }

    public addScrollEventListener(listener: ()=>void): void {
        this.eBodyViewport.addEventListener('scroll', listener);
    }

    public removeScrollEventListener(listener: ()=>void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}

enum ScrollType {
    HORIZONTAL, VERTICAL, DIAGONAL
}

interface Scroll {
    type: ScrollType
}

interface VerticalScroll extends Scroll{
    rowToScrollTo : RowNode
    focusedRowTopDelta: number
}

interface HorizontalScroll extends Scroll {
    columnToScrollTo: Column,
    columnToFocus: Column,
}

interface DiagonalScroll extends Scroll {
    rowToScrollTo : RowNode,
    focusedRowTopDelta: number,
    columnToScrollTo: Column
}


export interface TestKeyboardBindingGroupsResult {
    trappedKeyboardBinding: KeyboardBinding,
    trappedKeyboardBindingGroup: KeyboardBindingGroup
}


function testKeyboardBindingGroups (keyboardBindingGroups:KeyboardBindingGroup[], event:KeyboardEvent): TestKeyboardBindingGroupsResult{
    for (let i=0; i<keyboardBindingGroups.length; i++){
        let keyboardBindingGroup: KeyboardBindingGroup = keyboardBindingGroups[i];
        for (let j=0; j< keyboardBindingGroup.bindings.length; j++){
            let keyboardBinding = keyboardBindingGroup.bindings[j];
            if (testKeyboardBinding(keyboardBinding, event)){
                return {
                    trappedKeyboardBinding: keyboardBinding,
                    trappedKeyboardBindingGroup: keyboardBindingGroup
                }
            }
        }
    }
    return null;
}

function testKeyboardBinding (keyboardBinding:KeyboardBinding, event:KeyboardEvent): boolean{
    let key = event.which || event.keyCode;
    return (keyboardBinding.ctlRequired === event.ctrlKey) &&
        (keyboardBinding.keyCode === key) &&
        (keyboardBinding.altRequired === event.altKey);
}