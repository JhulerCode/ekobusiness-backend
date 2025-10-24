import { Router } from "express"
import controller from "./cUbigeos.js"

const router = Router()

router.get('/', controller.find)

export default router