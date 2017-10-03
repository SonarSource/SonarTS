export type NotificationLevel = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  message: string
  level: NotificationLevel
}
export type ShowNotificationCallback = (notification: Notification) => void

export interface Query {
  query: string
  variables: string
  date: Date
}

export interface NonScalarValue {
  id: string
  [key: string]: TypedValue
}

export type ScalarValue = number | string | Date | boolean
export type AtomicValue = ScalarValue | NonScalarValue
export type TypedValue = ScalarValue | NonScalarValue | Array<AtomicValue>
