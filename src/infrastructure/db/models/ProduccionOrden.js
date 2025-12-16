import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { ArticuloLinea } from './ArticuloLinea.js'
import { Maquina } from './Maquina.js'
import { Colaborador } from './Colaborador.js'

export const ProduccionOrden = sequelize.define('produccion_ordenes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY },
    linea: { type: DataTypes.STRING },
    orden: { type: DataTypes.INTEGER },

    maquina: { type: DataTypes.STRING }, //required //linked
    maquina_info: { type: DataTypes.JSON },

    articulo: { type: DataTypes.STRING }, //required //linked
    articulo_info: { type: DataTypes.JSON },
    cantidad: { type: DataTypes.DOUBLE },

    estado: { type: DataTypes.STRING },

    calidad_revisado: { type: DataTypes.STRING },
    cf_ppc: { type: DataTypes.STRING },

    observacion: { type: DataTypes.TEXT },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    estado_calidad_revisado: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.calidad_revisado ? 2 : 1
        }
    },

    estado_cf_ppc: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.cf_ppc ? 2 : 1
        }
    }
})

Articulo.hasMany(ProduccionOrden, { foreignKey: 'articulo', as: 'produccion_ordenes', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

ArticuloLinea.hasMany(ProduccionOrden, { foreignKey: 'linea', as: 'produccion_ordenes', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(ArticuloLinea, { foreignKey: 'linea', as: 'linea1' })

Maquina.hasMany(ProduccionOrden, { foreignKey: 'maquina', as: 'produccion_ordenes', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(Maquina, { foreignKey: 'maquina', as: 'maquina1' })

Colaborador.hasMany(ProduccionOrden, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ProduccionOrden, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })