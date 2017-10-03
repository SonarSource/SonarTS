import {Page} from 'ionic-framework/ionic';
import {ProfilePage} from '../profile/profile';
import {QuotesPage} from '../quotes/quotes';

// https://angular.io/docs/ts/latest/api/core/Type-interface.html
import {Type} from 'angular2/core';


@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  profilePage: Type = ProfilePage;
  quotesPage: Type = QuotesPage;

  constructor() {}

}
