export interface IAfterGuiAttachedParams {
    hidePopup?: (event?: any)=> void
}

export interface IComponent<T> {


    /** Return the DOM element of your editor, this is what the grid puts into the DOM */
    getGui(): HTMLElement;

    /** Gets called once by grid after editing is finished - if your editor needs to do any cleanup, do it here */
    destroy?(): void;

    /** A hook to perform any necessary operation just after the gui for this component has been renderer
     in the screen.
     If the filter popup is closed and reopened, this method is called each time the filter is shown.
     This is useful for any
     logic that requires attachment before executing, such as putting focus on a particular DOM
     element. The params has one callback method 'hidePopup', which you can call at any later
     point to hide the popup - good if you have an 'Apply' button and you want to hide the popup
     after it is pressed. */
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;

    /** The init(params) method is called on the filter once. See below for details on the parameters. */
    init?(params: T): void;

}
