import { Router } from 'express'
import controller from './cComprobantes.js'

const router = Router()

router.get('/', controller.find)
router.get('/pending/:socio_id', controller.getPendingTransacciones)
router.get('/:id', controller.findById)
router.post('/', controller.create)
router.put('/:id/vincular', controller.vincularTransacciones)

export default router
