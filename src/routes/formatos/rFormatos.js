import { Router } from "express"
import controller from "./cFormatos.js"

const router = Router()

router.get('/', controller.find)
router.get('/uno/:id', controller.findById)

export default router