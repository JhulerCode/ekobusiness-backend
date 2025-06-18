import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'

export const Documento = sequelize.define('documentos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING }, //required
    nombre: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.STRING },

    denominacion_legal: { type: DataTypes.STRING },
    denominacion_comercial: { type: DataTypes.STRING },
    registro_sanitario: { type: DataTypes.STRING },

    fecha_emision: { type: DataTypes.DATEONLY }, //required
    fecha_vencimiento: { type: DataTypes.DATEONLY }, //required
    recordar_dias: { type: DataTypes.INTEGER }, //required

    documento: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})