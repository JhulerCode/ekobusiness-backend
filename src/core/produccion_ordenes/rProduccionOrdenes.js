import { Router } from 'express'
import controller from './cProduccionOrdenes.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', verifyPermiso(['vPrograma:listar', 'vProduccionOrdenes:listar']), controller.find)

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

router.patch('/inicio/:id', controller.setInicio)

router.patch('/fin/:id', controller.setFin)

router.delete(
    '/:id',
    verifyPermiso(['vPrograma:eliminar', 'vProduccionOrdenes:eliminar']),
    controller.delet,
)

router.get(
    '/trazabilidad/:id',
    verifyPermiso(['vProduccionOrdenes:trazabilidad', 'vPtsIngresos:trazabilidad']),
    controller.findTrazabilidad,
)

export default router
