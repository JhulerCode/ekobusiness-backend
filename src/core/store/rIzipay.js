import { Router } from "express"
import controller from "../izipay/cIzipay.js"

const router = Router()

router.post("/create-payment", controller.createPayment);
router.post("/validate-payment", controller.validatePayment);
router.post("/ipn", controller.notificationIPN);
router.delete("/tarjeta/:id", controller.deleteTokenTarjeta);

export default router