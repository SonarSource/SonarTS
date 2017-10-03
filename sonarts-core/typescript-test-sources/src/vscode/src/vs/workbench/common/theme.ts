/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import nls = require('vs/nls');
import { registerColor, editorBackground, contrastBorder, transparent, badgeForeground, badgeBackground } from 'vs/platform/theme/common/colorRegistry';
import { IDisposable, Disposable, dispose } from 'vs/base/common/lifecycle';
import { IThemeService, ITheme } from 'vs/platform/theme/common/themeService';
import { Color } from 'vs/base/common/color';

// < --- Tabs --- >

export const TAB_ACTIVE_BACKGROUND = registerColor('tab.activeBackground', {
	dark: editorBackground,
	light: editorBackground,
	hc: editorBackground
}, nls.localize('tabActiveBackground', "Active tab background color. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_INACTIVE_BACKGROUND = registerColor('tab.inactiveBackground', {
	dark: '#2D2D2D',
	light: '#ECECEC',
	hc: null
}, nls.localize('tabInactiveBackground', "Inactive tab background color. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_BORDER = registerColor('tab.border', {
	dark: '#252526',
	light: '#F3F3F3',
	hc: contrastBorder
}, nls.localize('tabBorder', "Border to separate tabs from each other. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_ACTIVE_FOREGROUND = registerColor('tab.activeForeground', {
	dark: Color.white,
	light: '#333333',
	hc: Color.white
}, nls.localize('tabActiveEditorGroupActiveForeground', "Active tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_INACTIVE_FOREGROUND = registerColor('tab.inactiveForeground', {
	dark: transparent(TAB_ACTIVE_FOREGROUND, 0.5),
	light: transparent(TAB_ACTIVE_FOREGROUND, 0.5),
	hc: Color.white
}, nls.localize('tabInactiveEditorGroupActiveForeground', "Inactive tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));


// < --- Editors --- >

export const EDITOR_GROUP_BACKGROUND = registerColor('editorGroup.background', {
	dark: '#2D2D2D',
	light: '#ECECEC',
	hc: null
}, nls.localize('editorGroupBackground', "Background color of an editor group. Editor groups are the containers of editors. The background color shows up when dragging editor groups around."));

export const EDITOR_GROUP_HEADER_TABS_BACKGROUND = registerColor('editorGroupHeader.tabsBackground', {
	dark: '#252526',
	light: '#F3F3F3',
	hc: null
}, nls.localize('tabsContainerBackground', "Background color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));

export const EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = registerColor('editorGroupHeader.noTabsBackground', {
	dark: editorBackground,
	light: editorBackground,
	hc: editorBackground
}, nls.localize('editorGroupHeaderBackground', "Background color of the editor group title header when tabs are disabled. Editor groups are the containers of editors."));

export const EDITOR_GROUP_BORDER_COLOR = registerColor('editorGroup.border', {
	dark: '#444444',
	light: '#E7E7E7',
	hc: contrastBorder
}, nls.localize('editorGroupBorder', "Color to separate multiple editor groups from each other. Editor groups are the containers of editors."));

export const EDITOR_DRAG_AND_DROP_BACKGROUND = registerColor('editorGroup.dropBackground', {
	dark: Color.fromHex('#53595D').transparent(0.5),
	light: Color.fromHex('#3399FF').transparent(0.18),
	hc: null
}, nls.localize('editorDragAndDropBackground', "Background color when dragging editors around. The color should have transparency so that the editor contents can still shine through."));



// < --- Panels --- >

export const PANEL_BACKGROUND = registerColor('panel.background', {
	dark: editorBackground,
	light: editorBackground,
	hc: editorBackground
}, nls.localize('panelBackground', "Panel background color. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_BORDER_COLOR = registerColor('panel.border', {
	dark: Color.fromHex('#808080').transparent(0.35),
	light: Color.fromHex('#808080').transparent(0.35),
	hc: contrastBorder
}, nls.localize('panelBorder', "Panel border color on the top separating to the editor. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_ACTIVE_TITLE_COLOR = registerColor('panelTitle.activeForeground', {
	dark: '#E7E7E7',
	light: '#424242',
	hc: Color.white
}, nls.localize('panelActiveTitleForeground', "Title color for the active panel. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_INACTIVE_TITLE_COLOR = registerColor('panelTitle.inactiveForeground', {
	dark: transparent(PANEL_ACTIVE_TITLE_COLOR, 0.5),
	light: transparent(PANEL_ACTIVE_TITLE_COLOR, 0.75),
	hc: Color.white
}, nls.localize('panelInactiveTitleForeground', "Title color for the inactive panel. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_ACTIVE_TITLE_BORDER = registerColor('panelTitle.activeBorder', {
	dark: PANEL_BORDER_COLOR,
	light: PANEL_BORDER_COLOR,
	hc: contrastBorder
}, nls.localize('panelActiveTitleBorder', "Border color for the active panel title. Panels are shown below the editor area and contain views like output and integrated terminal."));



// < --- Status --- >

export const STATUS_BAR_FOREGROUND = registerColor('statusBar.foreground', {
	dark: '#FFFFFF',
	light: '#FFFFFF',
	hc: '#FFFFFF'
}, nls.localize('statusBarForeground', "Status bar foreground color. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_BACKGROUND = registerColor('statusBar.background', {
	dark: '#007ACC',
	light: '#007ACC',
	hc: null
}, nls.localize('statusBarBackground', "Standard status bar background color. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_NO_FOLDER_BACKGROUND = registerColor('statusBar.noFolderBackground', {
	dark: '#68217A',
	light: '#68217A',
	hc: null
}, nls.localize('statusBarNoFolderBackground', "Status bar background color when no folder is opened. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ITEM_ACTIVE_BACKGROUND = registerColor('statusBarItem.activeBackground', {
	dark: Color.white.transparent(0.18),
	light: Color.white.transparent(0.18),
	hc: Color.white.transparent(0.18)
}, nls.localize('statusBarItemActiveBackground', "Status bar item background color when clicking. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ITEM_HOVER_BACKGROUND = registerColor('statusBarItem.hoverBackground', {
	dark: Color.white.transparent(0.12),
	light: Color.white.transparent(0.12),
	hc: Color.white.transparent(0.12)
}, nls.localize('statusBarItemHoverBackground', "Status bar item background color when hovering. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_PROMINENT_ITEM_BACKGROUND = registerColor('statusBarItem.prominentBackground', {
	dark: '#388A34',
	light: '#388A34',
	hc: '#3883A4'
}, nls.localize('statusBarProminentItemBackground', "Status bar prominent items background color. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = registerColor('statusBarItem.prominentHoverBackground', {
	dark: '#369432',
	light: '#369432',
	hc: '#369432'
}, nls.localize('statusBarProminentItemHoverBackground', "Status bar prominent items background color when hovering. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window."));



// < --- Activity Bar --- >

export const ACTIVITY_BAR_BACKGROUND = registerColor('activityBar.background', {
	dark: '#333333',
	light: '#2C2C2C',
	hc: '#000000'
}, nls.localize('activityBarBackground', "Activity bar background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_FOREGROUND = registerColor('activityBar.foreground', {
	dark: Color.white,
	light: Color.white,
	hc: Color.white
}, nls.localize('activityBarForeground', "Activity bar foreground color (e.g. used for the icons). The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_DRAG_AND_DROP_BACKGROUND = registerColor('activityBar.dropBackground', {
	dark: Color.white.transparent(0.12),
	light: Color.white.transparent(0.12),
	hc: Color.white.transparent(0.12),
}, nls.localize('activityBarDragAndDropBackground', "Drag and drop feedback color for the activity bar items. The color should have transparency so that the activity bar entries can still shine through. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_BADGE_BACKGROUND = registerColor('activityBarBadge.background', {
	dark: badgeBackground,
	light: badgeBackground,
	hc: badgeBackground
}, nls.localize('activityBarBadgeBackground', "Activity notification badge background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_BADGE_FOREGROUND = registerColor('activityBarBadge.foreground', {
	dark: badgeForeground,
	light: badgeForeground,
	hc: badgeForeground
}, nls.localize('activityBarBadgeForeground', "Activity notification badge foreground color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));



// < --- Side Bar --- >

export const SIDE_BAR_BACKGROUND = registerColor('sideBar.background', {
	dark: '#252526',
	light: '#F3F3F3',
	hc: '#000000'
}, nls.localize('sideBarBackground', "Side bar background color. The side bar is the container for views like explorer and search."));

export const SIDE_BAR_TITLE_FOREGROUND = registerColor('sideBarTitle.foreground', {
	dark: '#BBBBBB',
	light: '#6f6f6f',
	hc: '#FFFFFF'
}, nls.localize('sideBarTitleForeground', "Side bar title foreground color. The side bar is the container for views like explorer and search."));

export const SIDE_BAR_SECTION_HEADER_BACKGROUND = registerColor('sideBarSectionHeader.background', {
	dark: Color.fromHex('#808080').transparent(0.2),
	light: Color.fromHex('#808080').transparent(0.2),
	hc: null
}, nls.localize('sideBarSectionHeaderBackground', "Side bar section header background color. The side bar is the container for views like explorer and search."));



// < --- Title Bar --- >

export const TITLE_BAR_ACTIVE_FOREGROUND = registerColor('titleBar.activeForeground', {
	dark: '#CCCCCC',
	light: '#333333',
	hc: '#FFFFFF'
}, nls.localize('titleBarActiveForeground', "Title bar foreground when the window is active. Note that this color is currently only supported on macOS."));

export const TITLE_BAR_INACTIVE_FOREGROUND = registerColor('titleBar.inactiveForeground', {
	dark: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
	light: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
	hc: null
}, nls.localize('titleBarInactiveForeground', "Title bar foreground when the window is inactive. Note that this color is currently only supported on macOS."));

export const TITLE_BAR_ACTIVE_BACKGROUND = registerColor('titleBar.activeBackground', {
	dark: '#3C3C3C',
	light: '#DDDDDD',
	hc: '#000000'
}, nls.localize('titleBarActiveBackground', "Title bar background when the window is active. Note that this color is currently only supported on macOS."));

export const TITLE_BAR_INACTIVE_BACKGROUND = registerColor('titleBar.inactiveBackground', {
	dark: transparent(TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
	light: transparent(TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
	hc: null
}, nls.localize('titleBarInactiveBackground', "Title bar background when the window is inactive. Note that this color is currently only supported on macOS."));

// < --- Notifications --- >

export const NOTIFICATIONS_FOREGROUND = registerColor('notification.foreground', {
	dark: '#EEEEEE',
	light: '#EEEEEE',
	hc: '#FFFFFF'
}, nls.localize('notificationsForeground', "Notifications foreground color. Notifications slide in from the top of the window."));

export const NOTIFICATIONS_BACKGROUND = registerColor('notification.background', {
	dark: '#333333',
	light: '#2C2C2C',
	hc: '#000000'
}, nls.localize('notificationsBackground', "Notifications background color. Notifications slide in from the top of the window."));

/**
 * Base class for all themable workbench components.
 */
export class Themable extends Disposable {
	private _toUnbind: IDisposable[];
	private theme: ITheme;

	constructor(
		protected themeService: IThemeService
	) {
		super();

		this._toUnbind = [];
		this.theme = themeService.getTheme();

		// Hook up to theme changes
		this._toUnbind.push(this.themeService.onThemeChange(theme => this.onThemeChange(theme)));
	}

	protected get toUnbind() {
		return this._toUnbind;
	}

	protected onThemeChange(theme: ITheme): void {
		this.theme = theme;

		this.updateStyles();
	}

	protected updateStyles(): void {
		// Subclasses to override
	}

	protected getColor(id: string, modify?: (color: Color, theme: ITheme) => Color): string {
		let color = this.theme.getColor(id);

		if (color && modify) {
			color = modify(color, this.theme);
		}

		return color ? color.toString() : null;
	}

	public dispose(): void {
		this._toUnbind = dispose(this._toUnbind);

		super.dispose();
	}
}
