import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

// Extiende y configura
dayjs.extend(utc)
dayjs.extend(timezone)
// dayjs.tz.setDefault('America/Lima')
const TZ = 'America/Lima'

export function formatDateOnly(data, format = 'DD-MM-YYYY') {
    if (!data) return null
    return dayjs(data).format(format)
}

export function formatDateTime(data, format = 'DD-MM-YYYY HH:mm:ss') {
    if (!data) return null
    return dayjs.utc(data).tz(TZ).format(format)
}

export default dayjs
