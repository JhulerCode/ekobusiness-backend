import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { PrecioLista } from './PrecioLista.js'

export const PrecioListaItem = sequelize.define('precio_lista_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    precio_lista: { type: DataTypes.STRING }, //required //linked
    articulo: { type: DataTypes.STRING }, //required //linked
    precio: { type: DataTypes.DOUBLE }, //required

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

PrecioLista.hasMany(PrecioListaItem, { foreignKey: 'precio_lista', as: 'precio_lista_items', onDelete: 'RESTRICT' })
PrecioListaItem.belongsTo(PrecioLista, { foreignKey: 'precio_lista', as: 'precio_lista1' })

Articulo.hasMany(PrecioListaItem, { foreignKey: 'articulo', as: 'precio_lista_items', onDelete: 'RESTRICT' })
PrecioListaItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })