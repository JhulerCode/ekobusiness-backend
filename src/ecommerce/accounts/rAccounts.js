import { Router } from "express"
import controller from "./cAccounts.js"

const router = Router()

router.get('/login', controller.login)
router.patch('/:id', controller.update)
router.post('/send-codigo', controller.sendCodigo)
router.post('/verify-codigo', controller.verifyCodigo)
router.post('/update-password', controller.updatePassword)
router.delete('/:id', controller.deleteUser)

router.get("/customer-wallet/:id", controller.getCustomerWallet);

export default router