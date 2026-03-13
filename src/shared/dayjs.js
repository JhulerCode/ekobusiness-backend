import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

// Extiende y configura
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('America/Lima')

export function formatDate(data, format = 'DD-MM-YYYY') {
    return dayjs(data).format(format)
}

export default dayjs
