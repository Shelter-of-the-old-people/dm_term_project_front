function isPastDate(deadline: string) {
  const [year, month, day] = deadline.split('-').map(Number)
  const today = new Date()
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const deadlineDate = new Date(year, month - 1, day)

  return deadlineDate.getTime() < todayAtMidnight.getTime()
}

export function isProjectClosed(status: string, deadline: string) {
  return status === '마감' || isPastDate(deadline)
}
