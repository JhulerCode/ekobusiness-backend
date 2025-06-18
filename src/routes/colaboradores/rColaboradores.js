import { Router } from "express"
import controller from "./cColaboradores.js"

const router = Router()

router.post('/', controller.create)
router.patch('/:id', controller.update)
router.get('/', controller.find)
router.get('/uno/:id', controller.findById)
router.delete('/:id', controller.delet)

router.patch('/preferencias/:id', controller.preferencias)

router.get('/login', controller.login)

export default router