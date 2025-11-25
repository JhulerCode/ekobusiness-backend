import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'

export const ActivityLog = sequelize.define('activity_logs', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    colaborador: { type: DataTypes.STRING }, //required
    method: { type: DataTypes.STRING }, //required
    baseUrl: { type: DataTypes.STRING }, //required
    detail: { type: DataTypes.JSON }, //required
    ip: { type: DataTypes.STRING }, //required
})

Colaborador.hasMany(ActivityLog, {foreignKey:'colaborador', onDelete:'RESTRICT'})
ActivityLog.belongsTo(Colaborador, {foreignKey:'colaborador', as:'colaborador1'})