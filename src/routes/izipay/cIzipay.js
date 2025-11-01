import sequelize from '../../database/sequelize.js'
import { SocioPedido, SocioPedidoItem } from "../../database/models/SocioPedido.js";
import { checkHash, createFormToken } from "../../lib/izipay.js"
import { genId } from '../../utils/mine.js'

import config from '../../config.js'
import { nodeMailer } from "../../lib/nodeMailer.js"
import { companyName, htmlConfirmacionCompra } from '../../utils/layouts.js'

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
            dataPayment.formAction = 'REGISTER_PAY'
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
            let msg = ''
            if (response.answer.errorCode == 'INT_015') {
                msg = 'Correo inválido'
            }

            return res.status(400).json({ code: 1, msg, error: response });
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
        pago_condicion, moneda, tipo_cambio, monto,
        entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos,
        comprobante_tipo, comprobante_ruc, comprobante_razon_social,
        observacion, estado, pagado,
        empresa_datos,
        socio_pedido_items,
    } = socio_pedido

    if (!checkHash(clientAnswer, hash, hashKey)) {
        res.json({ code: 1, msg: "Payment hash mismatch!" });
        return
    }

    // ----- GUARDAR PEDIDO ----- //
    const transaction = await sequelize.transaction()
    try {
        var nuevo = await SocioPedido.create({
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            pago_condicion, moneda, tipo_cambio, monto,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            observacion, estado, pagado,
            empresa_datos,
        }, { transaction })

        // ----- GUARDAR ITEMS ----- //
        const items = socio_pedido_items.map(a => ({ ...a, socio_pedido: nuevo.id, }))

        await SocioPedidoItem.bulkCreate(items, { transaction })

        await transaction.commit()

        console.log(`Pedido creado con éxito código: ${codigo}`)
    } catch (error) {
        await transaction.rollback()
        res.json({ code: 1, msg: 'Error al guardar el pedido', error })
        return
    }

    // ----- ENVIAR CORREO ----- //
    let send_email_err = false
    try {
        const entrega_tipos = [
            {
                id: 'envio',
                nombre: 'Envío a domicilio',
            },
            {
                id: 'retiro',
                nombre: 'Retira tu producto',
            },
        ]

        const entrega_tipo1 = entrega_tipos.find(a => a.id == entrega_tipo).nombre
        const html = htmlConfirmacionCompra(
            socio_datos.nombres, socio_datos.apellidos,
            codigo, entrega_tipo1, monto,
            socio_pedido_items
        )

        const nodemailer = nodeMailer()
        const result = await nodemailer.sendMail({
            from: `${companyName} <${config.SOPORTE_EMAIL}>`,
            to: socio_datos.correo,
            subject: `Confirmación de compra - Código ${codigo}`,
            html
        })
    } catch (error) {
        send_email_err = true
        console.log(error)
    }

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

    const [affectedRows] = await SocioPedido.update(
        {
            pagado: true,
            pago_id: transactionUUID
        },
        {
            where: { codigo: orderId }
        }
    );

    if (affectedRows === 0) {
        console.log(`Intento ${attempt}: No se actualizó el pedido: ${orderId}`);

        if (attempt < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return updateSocioPedidoPagado(orderId, transactionUUID, attempt + 1);
        } else {
            console.warn(`Se alcanzó el número máximo de intentos para actualizar el pedido: ${orderId}.`);
            return false;
        }
    }

    console.log(`Estado de pago actualizado para pedido: ${orderId}, en el intento ${attempt}.`);
}

export default {
    createPayment,
    validatePayment,
    notificationIPN,
}