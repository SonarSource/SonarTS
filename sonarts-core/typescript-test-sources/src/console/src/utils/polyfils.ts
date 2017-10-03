interface Array<T> {
  mapToObject<U>(keyFn: (T) => string, valFn: (T) => U): any
  find(predicate: (search: T) => boolean): T
  includes(search: T): boolean
  equals(array: Array<T>): boolean
}

Array.prototype.mapToObject = function (keyFn, valFn) {
  return this.reduce(
    (o, v) => {
      o[keyFn(v)] = valFn(v)
      return o
    },
    {},
  )
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined')
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function')
    }
    let list = Object(this)
    let length = list.length >>> 0
    let thisArg = arguments[1]
    let value

    for (let i = 0; i < length; i++) {
      value = list[i]
      if (predicate.call(thisArg, value, i, list)) {
        return value
      }
    }
    return undefined
  }
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    let O = Object(this)
    let len = parseInt(O.length, 10) || 0
    if (len === 0) {
      return false
    }
    let n = parseInt(arguments[1], 10) || 0
    let k
    if (n >= 0) {
      k = n
    } else {
      k = len + n
      if (k < 0) {
        k = 0
      }
    }
    let currentElement
    while (k < len) {
      currentElement = O[k]
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true
      }
      k++
    }
    return false
  }
}

if (!Array.prototype.equals) {
  Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array) {
      return false
    }

    // compare lengths - can save a lot of time
    if (this.length !== array.length) {
      return false
    }

    for (let i = 0; i < this.length; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i])) {
          return false
        }
      } else if (this[i] !== array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false
      }
    }
    return true
  }

  // Hide method from for-in loops
  Object.defineProperty(Array.prototype, 'equals', { enumerable: false })
}

interface Object {
  mapToArray<U, V>(fn: (str: string, U) => V): [V]
  filterNullAndUndefined(): Object
}

Object.defineProperty(Object.prototype, 'mapToArray', {
  value: function (fn) {
    let arr = []
    for (let index in this) {
      arr.push(fn(index, this[index]))
    }
    return arr
  },
})

Object.defineProperty(Object.prototype, 'filterNullAndUndefined', {
  value: function () {
    let o = Object.assign({}, this)
    Object.keys(o).forEach((k) => {
      if (o[k] === undefined || o[k] === null) {
        delete o[k]
      }
    })
    return o
  },
})

interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any
}

if (typeof Object.assign !== 'function') {
  Object.assign = function (target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object')
    }

    let output = Object(target)
    for (let index = 1; index < arguments.length; index++) {
      let source = arguments[index]
      if (source !== undefined && source !== null) {
        for (let nextKey in source) {
          if (source.hasOwnProperty(nextKey)) {
            output[nextKey] = source[nextKey]
          }
        }
      }
    }
    return output
  }
}

if (!Element.prototype.hasOwnProperty('scrollIntoViewIfNeeded')) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded

    const parent = this.parentNode
    const parentComputedStyle = window.getComputedStyle(parent, null)
    const parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width'), 10)
    const parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width'), 10)
    const overTop = this.offsetTop - parent.offsetTop < parent.scrollTop
    const overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) >
        (parent.scrollTop + parent.clientHeight)
    const overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft
    const overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) >
        (parent.scrollLeft + parent.clientWidth)
    const alignWithTop = overTop && !overBottom

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2
        - parentBorderTopWidth + this.clientHeight / 2
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2
        - parentBorderLeftWidth + this.clientWidth / 2
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop)
    }
  }
}
