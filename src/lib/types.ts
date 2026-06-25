export type Contract = {
  id: string
  customer: string
  hasLTC: boolean
  endDate: string
  tcv: number | ''
}

export type Reminder = {
  id: string
  date: string
  text: string
  done: boolean
}

export type ActionItem = {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  done: boolean
}

export type AppData = {
  contracts: Contract[]
  reminders: Reminder[]
  actionItems: ActionItem[]
}
