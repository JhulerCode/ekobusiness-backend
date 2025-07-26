import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'

export const Maquina = sequelize.define('maquinas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING }, //required
    codigo: { type: DataTypes.STRING }, //required
    nombre: { type: DataTypes.STRING }, //required
    fecha_compra: { type: DataTypes.DATEONLY }, //required
    
    produccion_tipo: { type: DataTypes.STRING }, //required
    velocidad: { type: DataTypes.DOUBLE },
    limpieza_tiempo: { type: DataTypes.DOUBLE },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Colaborador.hasMany(Maquina, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Maquina.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Maquina, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Maquina.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})