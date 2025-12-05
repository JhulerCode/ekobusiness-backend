import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { PrecioLista } from './PrecioLista.js'
import { Colaborador } from './Colaborador.js'

export const PrecioListaItem = sequelize.define('precio_lista_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    precio_lista: { type: DataTypes.STRING }, //required //linked
    articulo: { type: DataTypes.STRING }, //required //linked
    precio: { type: DataTypes.DOUBLE }, //required

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

PrecioLista.hasMany(PrecioListaItem, { foreignKey: 'precio_lista', as: 'precio_lista_items', onDelete: 'RESTRICT' })
PrecioListaItem.belongsTo(PrecioLista, { foreignKey: 'precio_lista', as: 'precio_lista1' })

Articulo.hasMany(PrecioListaItem, { foreignKey: 'articulo', as: 'precio_lista_items', onDelete: 'RESTRICT' })
PrecioListaItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Colaborador.hasMany(PrecioListaItem, {foreignKey:'createdBy', onDelete:'RESTRICT'})
PrecioListaItem.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(PrecioListaItem, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
PrecioListaItem.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})