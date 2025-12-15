import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import { checkHash, createFormToken, cancelPaymentMethodToken } from "#infrastructure/izipay.js"
import { genId } from '#shared/mine.js'
import cSistema from '../_sistema/cSistema.js'

import config from '../../config.js'
import { nodeMailer } from "#mail/nodeMailer.js"
import { htmlConfirmacionCompra } from '#mail/templates.js'
import dayjs from '#shared/dayjs.js'

const repository = new Repository('SocioPedido')
const SocioPedidoItemRepo = new Repository('SocioPedidoItem')

const createPayment = async (req, res) => {
    const { monto, correo, user_id, paymentMethodToken } = req.body;

    const orderId = genId()

    const dataPayment = {
        amount: monto * 100,
        currency: "PEN",
        orderId,
    }

    if (user_id) {
        if (paymentMethodToken == 'nueva') {
            // dataPayment.formAction = 'REGISTER_PAY'
            // dataPayment.formAction = "CUSTOMER_WALLET"
            dataPayment.formAction = 'ASK_REGISTER_PAY'
            dataPayment.customer = {
                reference: user_id,
                email: correo,
            }
        }
        else {
            dataPayment.paymentMethodToken = paymentMethodToken
        }
    }
    else {
        dataPayment.customer = {
            email: correo,
        }
    }

    try {
        const response = await createFormToken(dataPayment);

        if (response.status !== "SUCCESS") {
            let msg = null

            if (response.answer.errorCode == 'INT_015') {
                msg = 'Correo inválido'
            }

            return res.json({ code: 1, msg, error: response });
        } else {
            res.json({ code: 0, data: response.answer, orderId });
        }
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error });
    }
};

const validatePayment = async (req, res) => {
    const { paymentData, socio_pedido } = req.body
    const { clientAnswer, hash, hashKey } = paymentData;
    const {
        tipo, origin, fecha, codigo,
        socio, socio_datos, contacto, contacto_datos,
        moneda, tipo_cambio, monto,
        entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos, entrega_costo,
        pago_condicion, pago_metodo, pago_id,
        comprobante_tipo, comprobante_ruc, comprobante_razon_social,
        observacion, estado,
        empresa_datos,
        socio_pedido_items,
    } = socio_pedido

    if (!checkHash(clientAnswer, hash, hashKey)) {
        res.json({ code: 1, msg: "Payment hash mismatch!" });
        return
    }

    const etapas = [{ id: 1, fecha: dayjs() }]

    const transaction = await sequelize.transaction()

    try {
        // ----- GUARDAR PEDIDO ----- //
        var nuevo = await repository.create({
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            moneda, tipo_cambio, monto,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos, entrega_costo,
            pago_condicion, pago_metodo, pago_id,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            observacion, estado, etapas,
            empresa_datos,
            empresa,
        }, transaction)

        // ----- GUARDAR ITEMS ----- //
        const items = socio_pedido_items.map(a => ({ ...a, socio_pedido: nuevo.id, }))
        await SocioPedidoItemRepo.createBulk(items, transaction)

        await transaction.commit()

        console.log(`Pedido creado con éxito código: ${codigo}`)
    } catch (error) {
        await transaction.rollback()
        res.json({ code: 1, msg: 'Error al guardar el pedido', error })
        return
    }

    // ----- ENVIAR CORREO ----- //
    let send_email_err = null
    const entrega_tipo1 = cSistema.sistemaData.entrega_tipos.find(a => a.id == entrega_tipo).nombre
    const html = htmlConfirmacionCompra(
        socio_datos.nombres, socio_datos.apellidos,
        codigo, entrega_tipo1, monto,
        socio_pedido_items
    )

    const nodemailer = nodeMailer()
    const result = await nodemailer.sendMail({
        from: `${cSistema.sistemaData.empresa.nombre_comercial} <${config.SOPORTE_EMAIL}>`,
        to: socio_datos.correo,
        subject: `Confirmación de compra - Código ${codigo}`,
        html
    })

    if (result.error) send_email_err = result.error

    res.json({ code: 0, data: { id: nuevo.id }, send_email_err });
};

const notificationIPN = async (req, res) => {
    const paymentDataIPN = req.body;

    /* Retrieve the IPN content */
    const formAnswer = paymentDataIPN["kr-answer"];
    const hash = paymentDataIPN["kr-hash"];
    const hashKey = paymentDataIPN["kr-hash-key"];

    const dataParse = JSON.parse(formAnswer)
    /* Check the signature using password */
    if (!checkHash(dataParse, hash, hashKey)) {
        return res.status(400).send("Payment hash mismatch!");
    }

    /* Retrieve the transaction id from the IPN data */
    const transaction = dataParse.transactions[0];

    /* get some parameters from the answer */
    const orderStatus = dataParse.orderStatus;
    const orderId = dataParse.orderDetails.orderId;
    const transactionUUID = transaction.uuid;

    if (orderStatus === "PAID") {
        updateSocioPedidoPagado(orderId, transactionUUID)
    }

    /**
     * Message returned to the IPN caller
     * You can return what you want but
     * HTTP response code should be 200
     */
    res.status(200).send(`OK! OrderStatus is ${orderStatus}`);
}

async function updateSocioPedidoPagado(orderId, transactionUUID, attempt = 1) {
    const MAX_ATTEMPTS = 10;
    const RETRY_DELAY = 30_000; // 30 segundos

    const ped = await repository.find({ codigo: orderId }, true)

    if (!ped) {
        console.log(`Intento ${attempt}: No se actualizó el pedido: ${orderId}`);

        if (attempt < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return updateSocioPedidoPagado(orderId, transactionUUID, attempt + 1);
        } else {
            console.warn(`Se alcanzó el número máximo de intentos para actualizar el pedido: ${orderId}.`);
            return false;
        }
    }

    const etapas = ped.etapas
    etapas.push({ id: 2, fecha: dayjs() })

    await repository.update({ codigo: orderId }, {
        pagado: true,
        pago_id: transactionUUID,
        etapas,
    })

    console.log(`Estado de pago actualizado para pedido: ${orderId}, en el intento ${attempt}.`);
}

const deleteTokenTarjeta = async (req, res) => {
    const { id } = req.params;

    const dataPayment = {
        paymentMethodToken: id
    }

    try {
        const response = await cancelPaymentMethodToken(dataPayment);

        if (response.status !== "SUCCESS") {
            let msg = null

            return res.json({ code: 1, msg, error: response });
        } else {
            res.json({ code: 0, data: response.answer });
        }
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error });
    }
};

export default {
    createPayment,
    validatePayment,
    notificationIPN,
    deleteTokenTarjeta,
}