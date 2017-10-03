import {ITracker, Tracker, MockTracker} from 'graphcool-metrics'

let tracker: ITracker
if (__METRICS_ENDPOINT__) {
  tracker = new Tracker(__METRICS_ENDPOINT__)
} else {
  tracker = new MockTracker()
}

export default tracker
