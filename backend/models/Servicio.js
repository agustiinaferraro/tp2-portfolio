// Modelo (esquema) de Servicio
// Define qué datos tiene cada servicio que ofreces en el portfolio
import mongoose from 'mongoose';

const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio'],
    },
    // Identificador amigable para las URLs (ej. /servicios/diseno-ux-ui)
    slug: {
      type: String,
      required: [true, 'El slug del servicio es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Se exporta el modelo. El nombre en MongoDB será "servicios"
export default mongoose.model('Servicio', servicioSchema);