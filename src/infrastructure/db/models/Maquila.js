import sequelize from '../sequelize.js'
import { DataTypes } from 'sequelize'
import { Colaborador } from './Colaborador.js'
import { Socio } from './Socio.js'
import { Articulo } from './Articulo.js'
import { Moneda } from './Moneda.js'

export const Maquila = sequelize.define('maquilas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.SMALLINT }, //required
    fecha: { type: DataTypes.DATEONLY }, //required

    socio: { type: DataTypes.STRING }, //required //linked

    pago_condicion: { type: DataTypes.STRING }, //required
    moneda: { type: DataTypes.STRING }, //required //linked
    monto: { type: DataTypes.DOUBLE }, //required

    observacion: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Socio.hasMany(Maquila, { foreignKey: 'socio', as: 'maquilas', onDelete: 'RESTRICT' })
Maquila.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

Moneda.hasMany(Maquila, { foreignKey: 'moneda', as: 'maquilas', onDelete: 'RESTRICT' })
Maquila.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })

Colaborador.hasMany(Maquila, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Maquila.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Maquila, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Maquila.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })



export const MaquilaItem = sequelize.define('maquila_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orden: { type: DataTypes.INTEGER }, //required
    articulo: { type: DataTypes.STRING }, //required //linked
    cantidad: { type: DataTypes.DOUBLE }, //required

    vu: { type: DataTypes.DOUBLE }, //required
    igv_afectacion: { type: DataTypes.STRING }, //required
    igv_porcentaje: { type: DataTypes.DOUBLE }, //required

    observacion: { type: DataTypes.STRING },

    maquila: { type: DataTypes.STRING }, ////linked

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(MaquilaItem, { foreignKey: 'articulo', as: 'maquila_items', onDelete: 'RESTRICT' })
MaquilaItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Maquila.hasMany(MaquilaItem, { foreignKey: 'maquila', as: 'maquila_items', onDelete: 'RESTRICT' })
MaquilaItem.belongsTo(Maquila, { foreignKey: 'maquila', as: 'maquila1' })

Colaborador.hasMany(MaquilaItem, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
MaquilaItem.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(MaquilaItem, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
MaquilaItem.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })