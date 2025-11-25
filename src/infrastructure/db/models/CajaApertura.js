import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'

export const CajaApertura = sequelize.define('cajas_aperturas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha_apertura: { type: DataTypes.DATEONLY }, //required
    fecha_cierre: { type: DataTypes.DATEONLY }, //required
    monto_apertura: { type: DataTypes.DOUBLE }, //required
    monto_cierre: { type: DataTypes.DOUBLE }, //required
    estado: { type: DataTypes.STRING }, //required

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Colaborador.hasMany(CajaApertura, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CajaApertura.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CajaApertura, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CajaApertura.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})