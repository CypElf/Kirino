function formatDate(date) {
    const startMonth = String(date.getMonth() + 1).padStart(2, "0")
    const startDay = String(date.getDate()).padStart(2, "0")
    const startYear = date.getFullYear()
    const startHour = String(date.getHours()).padStart(2, "0")
    const startMinutes = String(date.getMinutes()).padStart(2, "0")
    return `${startHour}:${startMinutes} ${startDay}/${startMonth}/${startYear}`
}

module.exports = formatDate