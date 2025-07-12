import { Router } from "express"
import controller from "./cMaquinas.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vMaquinas',
        'vEquipos',
        'vProgramaFiltrantes',
        'vProgramaLuxury',
        'vProduccionHistorial',
        'vFormatosBpm:crear', 'vFormatosBpm:ver', 'vFormatosBpm:editar',
        'vFormatosPhs:crear', 'vFormatosPhs:ver', 'vFormatosPhs:editar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vMaquinas_crear',
        'vEquipos_crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vMaquinas_editar',
        'vEquipos_editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vMaquinas_editar',
        'vEquipos_editar',
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vMaquinas_eliminar',
        'vEquipos_eliminar',
    ]),
    controller.delet
)


export default router