import { Router } from "express"
import controller from "./cAuth.js"

const router = Router()

router.post('/', controller.createToNewsletter)
router.post('/register', controller.createUser)
router.post('/signin', controller.signin)

export default router