import { Router } from 'express'
import controller from './cArticuloSuppliers.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', controller.find)

export default router
