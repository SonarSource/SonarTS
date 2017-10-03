/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, ComponentRef} from '@angular/core';
import {getDOM} from '../../dom/dom_adapter';
import {window} from './browser';

export class ChangeDetectionPerfRecord {
  constructor(public msPerTick: number, public numTicks: number) {}
}

/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
export class AngularProfiler {
  appRef: ApplicationRef;

  constructor(ref: ComponentRef<any>) { this.appRef = ref.injector.get(ApplicationRef); }

  // tslint:disable:no-console
  /**
   * Exercises change detection in a loop and then prints the average amount of
   * time in milliseconds how long a single round of change detection takes for
   * the current state of the UI. It runs a minimum of 5 rounds for a minimum
   * of 500 milliseconds.
   *
   * Optionally, a user may pass a `config` parameter containing a map of
   * options. Supported options are:
   *
   * `record` (boolean) - causes the profiler to record a CPU profile while
   * it exercises the change detector. Example:
   *
   * ```
   * ng.profiler.timeChangeDetection({record: true})
   * ```
   */
  timeChangeDetection(config: any): ChangeDetectionPerfRecord {
    const record = config && config['record'];
    const profileName = 'Change Detection';
    // Profiler is not available in Android browsers, nor in IE 9 without dev tools opened
    const isProfilerAvailable = window.console.profile != null;
    if (record && isProfilerAvailable) {
      window.console.profile(profileName);
    }
    const start = getDOM().performanceNow();
    let numTicks = 0;
    while (numTicks < 5 || (getDOM().performanceNow() - start) < 500) {
      this.appRef.tick();
      numTicks++;
    }
    const end = getDOM().performanceNow();
    if (record && isProfilerAvailable) {
      // need to cast to <any> because type checker thinks there's no argument
      // while in fact there is:
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/Console/profileEnd
      (<any>window.console.profileEnd)(profileName);
    }
    const msPerTick = (end - start) / numTicks;
    window.console.log(`ran ${numTicks} change detection cycles`);
    window.console.log(`${msPerTick.toFixed(2)} ms per check`);

    return new ChangeDetectionPerfRecord(msPerTick, numTicks);
  }
}
