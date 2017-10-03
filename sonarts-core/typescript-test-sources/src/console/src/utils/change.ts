export function keysChanged(a: Object, b: Object, keys: string[]) {
  let changed = false
  keys.forEach(key => {
    if (a[key] !== b[key]) {
      changed = true
    }
  })
  return changed
}
