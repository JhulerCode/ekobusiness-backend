import { Router } from 'express'
import controller from './cProduccionOrdenes.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vPrograma:listar',
        'vProduccionOrdenes:listar',
        'vProduccionOrdenes:listar:responsable',
    ]),
    controller.find,
)

router.post('/', verifyPermiso(['vPrograma:crear', 'vProduccionOrdenes:crear']), controller.create)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vPrograma:ver',
        'vPrograma:editar',
        'vPrograma:salidaInsumos',
        'vProduccionOrdenes:ver',
        'vProduccionOrdenes:editar',
        'vProduccionOrdenes:salidaInsumos',
    ]),
    controller.findById,
)

router.patch(
    '/:id',
    verifyPermiso(['vPrograma:editar', 'vProduccionOrdenes:editar']),
    controller.update,
)

router.patch(
    '/abrir-cerrar/:id',
    verifyPermiso(['vPrograma:abrirCerrar', 'vProduccionOrdenes:abrirCerrar']),
    controller.abrirCerrar,
)

router.patch('/inicio-fin/:id', controller.inicioFin)

router.delete(
    '/:id',
    verifyPermiso(['vPrograma:eliminar', 'vProduccionOrdenes:eliminar']),
    controller.delet,
)

export default router
