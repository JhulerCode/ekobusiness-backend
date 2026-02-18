import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { Socio } from './Socio.js'
import { Moneda } from './Moneda.js'
import { Colaborador } from './Colaborador.js'

export const ArticuloSupplier = sequelize.define('articulo_suppliers', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    articulo: { type: DataTypes.STRING },
    socio: { type: DataTypes.STRING },
    min_qty: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    currency_id: { type: DataTypes.STRING },
    delay: { type: DataTypes.STRING },
    date_start: { type: DataTypes.STRING },
    date_end: { type: DataTypes.STRING },
    product_code: { type: DataTypes.STRING },
    product_name: { type: DataTypes.STRING },
    sequence: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(ArticuloSupplier, {
    foreignKey: 'articulo',
    as: 'articulo_suppliers',
    onDelete: 'RESTRICT',
})
ArticuloSupplier.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Socio.hasMany(ArticuloSupplier, {
    foreignKey: 'socio',
    as: 'articulo_suppliers',
    onDelete: 'RESTRICT',
})
ArticuloSupplier.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

Moneda.hasMany(ArticuloSupplier, {
    foreignKey: 'currency_id',
    as: 'articulo_suppliers',
    onDelete: 'RESTRICT',
})
ArticuloSupplier.belongsTo(Moneda, { foreignKey: 'currency_id', as: 'currency_id1' })

Colaborador.hasMany(ArticuloSupplier, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ArticuloSupplier.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ArticuloSupplier, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ArticuloSupplier.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
