import { Router } from "express"
import controller from "../socios/cSocios.js"

const router = Router()

router.post('/register', controller.createUser)
router.post('/login', controller.loginUser)

router.get('/verify', controller.verifyLogin)
router.patch('/:id', controller.update)

router.patch('/:id', controller.update)
router.post('/send-codigo', controller.sendCodigo)
router.post('/verify-codigo', controller.verifyCodigo)
router.post('/update-password', controller.updatePassword)
router.delete('/:id', controller.deleteUser)

export default router