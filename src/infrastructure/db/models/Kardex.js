import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { Articulo } from './Articulo.js'
import { Transaccion, TransaccionItem } from './Transaccion.js'
import { ProduccionOrden } from './ProduccionOrden.js'
import { Maquina } from './Maquina.js'
import { Moneda } from './Moneda.js'

export const Kardex = sequelize.define('kardexes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.SMALLINT },
    fecha: { type: DataTypes.DATEONLY },

    articulo: { type: DataTypes.STRING },
    cantidad: { type: DataTypes.DECIMAL(10, 2) },

    pu: { type: DataTypes.DOUBLE }, //required
    igv_afectacion: { type: DataTypes.STRING }, //required
    igv_porcentaje: { type: DataTypes.DOUBLE }, //required
    moneda: { type: DataTypes.STRING }, //required //linked
    tipo_cambio: { type: DataTypes.DOUBLE }, //required

    lote: { type: DataTypes.STRING },
    fv: { type: DataTypes.DATEONLY },

    is_lote_padre: { type: DataTypes.BOOLEAN }, //required //linked
    stock: { type: DataTypes.DECIMAL(10, 2) }, //required
    lote_padre: { type: DataTypes.STRING }, //required //linked

    transaccion: { type: DataTypes.STRING }, //linked
    transaccion_item: { type: DataTypes.STRING }, //linked
    produccion_orden: { type: DataTypes.STRING }, //linked
    maquina: { type: DataTypes.STRING }, // linked

    observacion: { type: DataTypes.TEXT },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Articulo.hasMany(Kardex, { foreignKey: 'articulo', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Moneda.hasMany(Kardex, { foreignKey: 'moneda', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })

Kardex.hasMany(Kardex, { foreignKey: 'lote_padre', as: 'lote_padre_items', onDelete: 'RESTRICT' })
Kardex.belongsTo(Kardex, { foreignKey: 'lote_padre', as: 'lote_padre1' })

Transaccion.hasMany(Kardex, { foreignKey: 'transaccion', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Transaccion, { foreignKey: 'transaccion', as: 'transaccion1' })

TransaccionItem.hasMany(Kardex, { foreignKey: 'transaccion_item', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(TransaccionItem, { foreignKey: 'transaccion_item', as: 'transaccion_item1' })

ProduccionOrden.hasMany(Kardex, { foreignKey: 'produccion_orden', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(ProduccionOrden, { foreignKey: 'produccion_orden', as: 'produccion_orden1' })

Maquina.hasMany(Kardex, { foreignKey: 'maquina', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Maquina, { foreignKey: 'maquina', as: 'maquina1' })

Colaborador.hasMany(Kardex, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Kardex.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Kardex, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Kardex.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })