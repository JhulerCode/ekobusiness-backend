import { Router } from "express"
import controller from "./cMaquinas.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vMaquinas:listar',
        'vEquipos:listar',
        'vPrograma:listar',
        // 'vProgramaLuxury:listar',
        'vProduccionHistorial:listar',
        'vFormatosBpm:crear', 'vFormatosBpm:ver', 'vFormatosBpm:editar',
        'vFormatosPhs:crear', 'vFormatosPhs:ver', 'vFormatosPhs:editar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vMaquinas:crear',
        'vEquipos:crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vMaquinas:editar',
        'vEquipos:editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vMaquinas:editar',
        'vEquipos:editar',
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vMaquinas:eliminar',
        'vEquipos:eliminar',
    ]),
    controller.delet
)


export default router