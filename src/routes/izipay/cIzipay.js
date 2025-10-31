import { SocioPedido } from "../../database/models/SocioPedido.js";
import { checkHash, createFormToken } from "../../lib/izipay.js"
import { genId } from '../../utils/mine.js'

const createPayment = async (req, res) => {
    const { monto, correo, user_id, paymentMethodToken } = req.body;

    const orderId = genId()
    // console.log(orderId)

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

const validatePayment = (req, res) => {
    const { clientAnswer, hash, hashKey } = req.body;

    if (!checkHash(clientAnswer, hash, hashKey)) {
        res.status(400).json({ code: 1, msg: "Payment hash mismatch!" });
        return
    }

    res.json({ code: 0 });
};

const notificationIPN = async (req, res) => {
    const paymentDataIPN = req.body;
    console.log("IPN:", paymentDataIPN);
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
        //--- Actualizar a pagado ---//
        const [affectedRows] = await SocioPedido.update(
            {
                pagado: true,
                pago_id: transactionUUID
            },
            { codigo: orderId },
        )

        console.log(affectedRows)
        console.log(`Estado de pago actualizado para socio_pedido ${orderId}`)
    }

    /**
     * Message returned to the IPN caller
     * You can return what you want but
     * HTTP response code should be 200
     */
    res.status(200).send(`OK! OrderStatus is ${orderStatus}`);
}

export default {
    createPayment,
    validatePayment,
    notificationIPN,
}