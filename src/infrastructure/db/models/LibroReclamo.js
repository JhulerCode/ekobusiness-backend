import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'

export const LibroReclamo = sequelize.define('libro_reclamos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    codigo: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING },
    fecha_recepcion: { type: DataTypes.DATEONLY },
    fecha_respuesta: { type: DataTypes.DATEONLY },
    observaciones: { type: DataTypes.TEXT },

    nombres: { type: DataTypes.STRING },
    apellidos: { type: DataTypes.STRING },
    doc_tipo: { type: DataTypes.STRING },
    doc_numero: { type: DataTypes.STRING },
    correo: { type: DataTypes.STRING },
    direccion: { type: DataTypes.STRING },
    menor_edad: { type: DataTypes.BOOLEAN, defaultValue: false },

    pedido_codigo: { type: DataTypes.STRING },
    monto: { type: DataTypes.DOUBLE },
    producto_descripcion: { type: DataTypes.TEXT },

    tipo: { type: DataTypes.STRING },
    resumen: { type: DataTypes.TEXT },
    detalle: { type: DataTypes.TEXT },
})