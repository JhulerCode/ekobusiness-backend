import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Transaccion, TransaccionItem } from './Transaccion.js'
import { ProduccionOrden } from './ProduccionOrden.js'
import { Maquina } from './Maquina.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'
import { CuarentenaProducto } from './CuarentenaProducto.js'

export const FormatoValue = sequelize.define('formato_values', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    codigo: { type: DataTypes.STRING },
    values: { type: DataTypes.JSON },
    transaccion_item: { type: DataTypes.STRING }, //linked
    produccion_orden: { type: DataTypes.STRING }, //linked
    transaccion: { type: DataTypes.STRING }, //linked
    maquina: { type: DataTypes.STRING }, //linked
    articulo: { type: DataTypes.STRING }, //linked
    colaborador: { type: DataTypes.STRING }, //linked
    cuarentena_producto: { type: DataTypes.STRING }, //linked

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

TransaccionItem.hasMany(FormatoValue, { foreignKey: 'transaccion_item', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(TransaccionItem, { foreignKey: 'transaccion_item', as: 'transaccion_item1' })

ProduccionOrden.hasMany(FormatoValue, { foreignKey: 'produccion_orden', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(ProduccionOrden, { foreignKey: 'produccion_orden', as: 'produccion_orden1' })

Maquina.hasMany(FormatoValue, { foreignKey: 'maquina', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(Maquina, { foreignKey: 'maquina', as: 'maquina1' })

Transaccion.hasMany(FormatoValue, { foreignKey: 'transaccion', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(Transaccion, { foreignKey: 'transaccion', as: 'transaccion1' })

Articulo.hasMany(FormatoValue, { foreignKey: 'articulo', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Colaborador.hasMany(FormatoValue, { foreignKey: 'colaborador', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(Colaborador, { foreignKey: 'colaborador', as: 'colaborador1' })

CuarentenaProducto.hasMany(FormatoValue, { foreignKey: 'cuarentena_producto', as: 'formato_values', onDelete: 'RESTRICT' })
FormatoValue.belongsTo(CuarentenaProducto, { foreignKey: 'cuarentena_producto', as: 'cuarentena_producto1' })

Colaborador.hasMany(FormatoValue, {foreignKey:'createdBy', onDelete:'RESTRICT'})
FormatoValue.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(FormatoValue, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
FormatoValue.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})