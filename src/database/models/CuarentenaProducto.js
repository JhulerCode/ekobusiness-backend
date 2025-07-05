import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { ProduccionOrden } from './ProduccionOrden.js'
import { Colaborador } from './Colaborador.js'

export const CuarentenaProducto = sequelize.define('cuarentena_productos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    lote: { type: DataTypes.STRING },
    fv: { type: DataTypes.DATEONLY },
    cantidad: { type: DataTypes.DOUBLE },
    cantidad_inicial: { type: DataTypes.DOUBLE },
    estado: { type: DataTypes.STRING },

    produccion_orden: { type: DataTypes.STRING }, //linked

    cf_liberacion_lote: { type: DataTypes.STRING }, //linked

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

ProduccionOrden.hasMany(CuarentenaProducto, { foreignKey: 'produccion_orden', as: 'cuarentena_productos', onDelete: 'RESTRICT' })
CuarentenaProducto.belongsTo(ProduccionOrden, { foreignKey: 'produccion_orden', as: 'produccion_orden1' })

Colaborador.hasMany(CuarentenaProducto, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CuarentenaProducto.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CuarentenaProducto, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CuarentenaProducto.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})