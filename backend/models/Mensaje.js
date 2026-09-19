//modelo de un mensaje del formulario de contacto
//"timestamps: true" agrega createdat y updatedat automaticamente
import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
    },
    mensaje: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
    },
  },
  {
    timestamps: true,
  }
);

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

export default Mensaje;