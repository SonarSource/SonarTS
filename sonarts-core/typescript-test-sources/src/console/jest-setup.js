const idObj = require('identity-obj-proxy')

global['__BACKEND_ADDR__'] = 'http://test-host'
global['__METRICS_ENDPOINT__'] = false
global['analytics'] = {
  track: () => {}
}
