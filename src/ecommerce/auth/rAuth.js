import { Router } from "express"
import controller from "./cAuth.js"
import { authRateLimiter } from "#http/middlewares/rateLimiter.js"

const router = Router()

router.post('/', controller.createToNewsletter)
router.post('/register', authRateLimiter, controller.createUser)
router.post('/signin', authRateLimiter, controller.signin)
router.post('/refresh', controller.refresh)
router.post('/logout', controller.logout)

export default router