import { Router } from 'express'
import controller from './cArticuloSuppliers.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', controller.find)

router.get(
    '/uno/:id',
    verifyPermiso(['vPreciosCompra:ver', 'vPreciosCompra:editar']),
    controller.findById,
)

router.post('/', verifyPermiso(['vPreciosCompra:crear']), controller.create)

router.patch('/:id', verifyPermiso(['vPreciosCompra:editar']), controller.update)

router.delete('/:id', verifyPermiso(['vPreciosCompra:eliminar']), controller.delet)

export default router
