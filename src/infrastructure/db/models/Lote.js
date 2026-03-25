import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'
import { TransaccionItem } from './Transaccion.js'

export const Lote = sequelize.define('lotes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    codigo: { type: DataTypes.STRING },
    fv: { type: DataTypes.DATEONLY },
    vu: { type: DataTypes.DOUBLE },
    igv_afectacion: { type: DataTypes.STRING },
    igv_porcentaje: { type: DataTypes.DOUBLE },

    stock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    articulo: { type: DataTypes.STRING },
    transaccion_item: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(Lote, { foreignKey: 'articulo', as: 'lotes', onDelete: 'RESTRICT' })
Lote.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

TransaccionItem.hasMany(Lote, { foreignKey: 'transaccion_item', as: 'lotes', onDelete: 'RESTRICT' })
Lote.belongsTo(TransaccionItem, { foreignKey: 'transaccion_item', as: 'transaccion_item1' })

Colaborador.hasMany(Lote, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Lote.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Lote, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Lote.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
