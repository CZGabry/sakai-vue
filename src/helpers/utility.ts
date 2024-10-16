export function getPropertyByPath(obj: object, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export function getTruncatedPropertyByPath(obj: object, path: string, length: number) {
  const value = path.split('.').reduce((acc, part) => acc && acc[part], obj)
  
  if (typeof value === 'string') {
    return value.length > length ? value.slice(0, length) : value;
  }
}


export function deepClone(obj: any) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const copy = Object.create(Object.getPrototypeOf(obj))
  Object.assign(copy, obj)

  for (const key in copy) {
    if (copy.hasOwnProperty(key)) {
      copy[key] = deepClone(copy[key])
    }
  }

  return copy
}
