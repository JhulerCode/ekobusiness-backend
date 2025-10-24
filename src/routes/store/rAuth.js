import { Router } from "express"
import controller from "../socios/cSocios.js"

const router = Router()

router.post('/register', controller.createUser)
router.post('/login', controller.loginUser)

router.get('/verify', controller.verifyLogin)
router.patch('/:id', controller.update)

export default router