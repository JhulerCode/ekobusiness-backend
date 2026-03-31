import { redis } from '#infrastructure/redis/index.js'

const find = async (req, res) => {
    try {
        const keysList = await redis.keys('user:*')
        const data = []
        for (const key of keysList) {
            const val = await redis.get(key)
            if (val) {
                const sessionData = JSON.parse(val)
                data.push({
                    key: key.replace('user:', ''),
                    ...sessionData,
                })
            }
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}