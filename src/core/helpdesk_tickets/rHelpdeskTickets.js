import { Router } from 'express'
import controller from './cHelpdeskTickets.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', verifyPermiso(['vHelpdeskTickets:listar']), controller.find)

router.post('/', verifyPermiso(['vHelpdeskTickets:crear']), controller.create)

router.get('/uno/:id', verifyPermiso(['vHelpdeskTickets:editar']), controller.findById)

router.patch('/:id', verifyPermiso(['vHelpdeskTickets:editar']), controller.update)

router.delete('/:id', verifyPermiso(['vHelpdeskTickets:eliminar']), controller.delet)

export default router
