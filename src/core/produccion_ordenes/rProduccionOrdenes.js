import { Router } from 'express'
import controller from './cProduccionOrdenes.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', verifyPermiso(['vPrograma:listar', 'vProduccionHistorial:listar']), controller.find)

router.post(
    '/',
    verifyPermiso(['vPrograma:crear', 'vProduccionHistorial:crear']),
    controller.create,
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vPrograma:ver',
        'vPrograma:editar',
        'vPrograma:salidaInsumos',
        'vProduccionHistorial:ver',
        'vProduccionHistorial:editar',
        'vProduccionHistorial:salidaInsumos',
    ]),
    controller.findById,
)

router.patch(
    '/:id',
    verifyPermiso(['vPrograma:editar', 'vProduccionHistorial:editar']),
    controller.update,
)

router.patch(
    '/abrir-cerrar/:id',
    verifyPermiso(['vPrograma:abrirCerrar', 'vProduccionHistorial:abrirCerrar']),
    controller.abrirCerrar,
)

router.patch('/inicio/:id', controller.setInicio)

router.patch('/fin/:id', controller.setFin)

router.delete(
    '/:id',
    verifyPermiso(['vPrograma:eliminar', 'vProduccionHistorial:eliminar']),
    controller.delet,
)

router.get(
    '/trazabilidad/:id',
    verifyPermiso(['vProduccionHistorial:trazabilidad', 'vPtsIngresos:trazabilidad']),
    controller.findTrazabilidad,
)

export default router
