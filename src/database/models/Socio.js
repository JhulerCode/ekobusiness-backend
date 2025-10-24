import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { PrecioLista } from './PrecioLista.js'
import { Colaborador } from './Colaborador.js'

export const Socio = sequelize.define('socios', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.SMALLINT }, //required

    doc_tipo: { type: DataTypes.STRING }, //required
    doc_numero: { type: DataTypes.STRING }, //required
    nombres: { type: DataTypes.STRING }, //required
    apellidos: { type: DataTypes.STRING }, //required

    correo: { type: DataTypes.STRING },
    telefono1: { type: DataTypes.STRING },
    telefono2: { type: DataTypes.STRING },
    web: { type: DataTypes.STRING },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }, //required

    direcciones: { type: DataTypes.JSON, defaultValue: [] },

    contactos: { type: DataTypes.JSON, defaultValue: [] },

    precio_lista: { type: DataTypes.STRING },
    pago_condicion: { type: DataTypes.STRING },
    // credito: { type: DataTypes.DOUBLE },
    bancos: { type: DataTypes.JSON, defaultValue: [] },
    pago_metodos: { type: DataTypes.JSON, defaultValue: [] },

    documentos: { type: DataTypes.JSON, defaultValue: [] },

    only_newsletter: { type: DataTypes.BOOLEAN, defaultValue: false },
    contrasena: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    nombres_apellidos: {
        type: DataTypes.VIRTUAL,
        get() {
            const nombres = this.nombres || ''
            const apellidos = this.apellidos || ''
            return `${nombres} ${apellidos}`.trim()
        }
    }
})

PrecioLista.hasMany(Socio, { foreignKey: 'precio_lista', as: 'socios', onDelete: 'RESTRICT' })
Socio.belongsTo(PrecioLista, { foreignKey: 'precio_lista', as: 'precio_lista1' })

Colaborador.hasMany(Socio, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Socio.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Socio, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Socio.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })