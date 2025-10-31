import axios from "axios";
import config from '../config.js';
import Hex from 'crypto-js/enc-hex.js';
import hmacSHA256 from 'crypto-js/hmac-sha256.js';

export const createFormToken = async (paymentConf) => {
    const createPaymentEndPoint = `https://${config.IZIPAY_MERCHANT_ID}:${config.IZIPAY_SECRET_KEY}@api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment`

    try {
        const response = await axios.post(createPaymentEndPoint, paymentConf, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}

export const checkHash = (answer, hash, hashKey) => {
    let key = '';
    if (hashKey === "sha256_hmac") {
        key = config.IZIPAY_HMAC_SHA_256;
    } else if (hashKey === "password") {
        key = config.IZIPAY_SECRET_KEY;
    }
    
    const answerHash = Hex.stringify(hmacSHA256(JSON.stringify(answer), key));
    return hash === answerHash;
};

export const customerWalletGet = async (paymentConf) => {
    const endPoint = `https://${config.IZIPAY_MERCHANT_ID}:${config.IZIPAY_SECRET_KEY}@api.micuentaweb.pe/api-payment/V4/CustomerWallet/Get`

    try {
        const response = await axios.post(endPoint, paymentConf, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}