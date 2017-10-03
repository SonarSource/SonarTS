/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WebDriverAdapter} from '../web_driver_adapter';

/**
 * Adapter for the selenium-webdriver.
 */
export class SeleniumWebDriverAdapter extends WebDriverAdapter {
  static PROTRACTOR_PROVIDERS = [{
    provide: WebDriverAdapter,
    useFactory: () => new SeleniumWebDriverAdapter((<any>global).browser)
  }];

  constructor(private _driver: any) { super(); }

  waitFor(callback: () => any): Promise<any> { return this._driver.call(callback); }

  executeScript(script: string): Promise<any> { return this._driver.executeScript(script); }

  executeAsyncScript(script: string): Promise<any> {
    return this._driver.executeAsyncScript(script);
  }

  capabilities(): Promise<{[key: string]: any}> {
    return this._driver.getCapabilities().then((capsObject: any) => {
      const localData: {[key: string]: any} = {};
      capsObject.forEach((value: any, key: string) => { localData[key] = value; });
      return localData;
    });
  }

  logs(type: string): Promise<any> {
    // Needed as selenium-webdriver does not forward
    // performance logs in the correct way via manage().logs
    return this._driver.schedule(
        new Command('getLog').setParameter('type', type),
        'WebDriver.manage().logs().get(' + type + ')');
  }
}

/**
 * Copy of the `Command` class of webdriver as
 * it is not exposed via index.js in selenium-webdriver.
 */
class Command {
  private parameters_: {[key: string]: any} = {};
  constructor(private name_: string) {}

  getName() { return this.name_; }

  setParameter(name: string, value: any) {
    this.parameters_[name] = value;
    return this;
  }

  setParameters(parameters: {[key: string]: any}) {
    this.parameters_ = parameters;
    return this;
  }

  getParameter(key: string) { return this.parameters_[key]; }

  getParameters() { return this.parameters_; }
}
