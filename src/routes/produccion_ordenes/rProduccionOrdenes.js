import { Router } from "express"
import controller from "./cProduccionOrdenes.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vProgramaFiltrantes:listar',
        'vProgramaGranel:listar',
        'vProgramaLuxury:listar',
        'vProduccionHistorial:listar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vProgramaFiltrantes:crear',
        'vProgramaGranel:crear',
        'vProgramaLuxury:crear'
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vProgramaFiltrantes:ver', 'vProgramaFiltrantes:editar', 'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:ver', 'vProgramaGranel:editar', 'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:ver', 'vProgramaLuxury:editar', 'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:ver', 'vProduccionHistorial:salidaInsumos',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vProgramaFiltrantes:editar',
        'vProgramaGranel:editar',
        'vProgramaLuxury:editar'
    ]),
    controller.update
)

router.patch(
    '/terminar/:id',
    verifyPermiso([
        'vProgramaFiltrantes:terminar',
        'vProgramaGranel:terminar',
        'vProgramaLuxury:terminar'
    ]),
    controller.terminar
)

router.delete(
    '/:id',
    verifyPermiso([
        'vProgramaFiltrantes:eliminar',
        'vProgramaGranel:eliminar',
        'vProgramaLuxury:eliminar'
    ]),
    controller.delet
)

router.get(
    '/trazabilidad/:id',
    verifyPermiso([
        'vProductosCuarentena:trazabilidad',
    ]),
    controller.findTrazabilidad
)

export default router