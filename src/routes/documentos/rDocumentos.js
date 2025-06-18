import { Router } from "express"
import controller from "./cDocumentos.js"

const router = Router()

router.post('/', controller.create)
router.patch('/:id', controller.update)
router.get('/', controller.find)
router.get('/uno/:id', controller.findById)
router.delete('/:id', controller.delet)
router.patch('/uploadDoc/:id', controller.uploadDoc)

export default router