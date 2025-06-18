import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Moneda } from './Moneda.js'

export const TipoCambio = sequelize.define('tipo_cambios', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY }, //required
    compra: { type: DataTypes.DOUBLE }, //required
    venta: { type: DataTypes.DOUBLE }, //required

    moneda: { type: DataTypes.STRING }, //required //linked

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Moneda.hasMany(TipoCambio, { foreignKey: 'moneda', as: 'tipo_cambios', onDelete: 'RESTRICT' })
TipoCambio.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })