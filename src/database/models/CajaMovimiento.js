import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { CajaApertura } from './CajaApertura.js'
import { Colaborador } from './Colaborador.js'

export const CajaMovimiento = sequelize.define('caja_movimientos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY }, //required
    tipo: { type: DataTypes.STRING }, //required
    detalle: { type: DataTypes.STRING }, //required
    monto: { type: DataTypes.DOUBLE }, //required

    caja_apertura: { type: DataTypes.STRING }, //required linked

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

CajaApertura.hasMany(CajaMovimiento, { foreignKey: 'caja_apertura', as: 'caja_movimientos', onDelete: 'RESTRICT' })
CajaMovimiento.belongsTo(CajaApertura, { foreignKey: 'caja_apertura', as: 'caja_apertura1' })

Colaborador.hasMany(CajaMovimiento, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CajaMovimiento.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CajaMovimiento, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CajaMovimiento.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})