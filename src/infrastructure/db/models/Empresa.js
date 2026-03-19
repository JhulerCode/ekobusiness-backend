import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'

export const Empresa = sequelize.define('empresas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ruc: { type: DataTypes.STRING },
    razon_social: { type: DataTypes.STRING },
    nombre_comercial: { type: DataTypes.STRING },

    telefono: { type: DataTypes.STRING },
    correo: { type: DataTypes.STRING },
    igv_porcentaje: { type: DataTypes.FLOAT, defaultValue: 18 },
    logo: { type: DataTypes.JSON, defaultValue: {} },

    direcciones: { type: DataTypes.JSON },
    bancos: { type: DataTypes.JSON },

    yape_number: { type: DataTypes.STRING },
    ecommerce_url: { type: DataTypes.STRING },
    facebook_url: { type: DataTypes.STRING },
    instagram_url: { type: DataTypes.STRING },
    whatsapp_ventas: { type: DataTypes.STRING },
    whatsapp_ventas_url: { type: DataTypes.STRING },

    subdominio: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})
