import { sessionStore } from '#store/sessions.js'

const find = async (req, res) => {
    try {
        const data = Array.from(sessionStore.entries()).map(([key, value]) => ({
            key,
            ...value
        }))

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}