export function generateSlots(startTime, endTime) {
  let slots = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  let startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  while (startMinutes + 60 <= endMinutes) {
    const h = Math.floor(startMinutes / 60)
    const m = startMinutes % 60
    const slotTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    slots.push(slotTime)
    startMinutes += 60
  }
  return slots
}

export function validatePeopleCount(val, game) {
  if (game) {
    const min = game.giocatori_min
    const max = game.giocatori_max
    if (val < min || val > max) {
      return `Inserisci un numero tra ${min} e ${max}`
    }
  }
  return true
}
