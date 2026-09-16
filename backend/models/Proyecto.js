// Modelo (esquema) de Proyecto
// Define qué datos tiene cada proyecto del portfolio y sus tipos
import mongoose from 'mongoose';

const proyectoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
    },
    resumen: {
      // Qué problema había y cómo se resolvió
      type: String,
      default: '',
    },
    tags: {
      // Roles aplicados, ej: ["UX/UI", "Full Stack", "Motion"]
      type: [String],
      default: [],
    },
    imagen: {
      // URL de la imagen (más adelante vendrá de Cloudinary)
      type: String,
      default: '',
    },
    link: {
      // URL al proyecto publicado o repositorio
      type: String,
      default: '',
    },
    destacado: {
      // true = proyecto destacado, false = normal
      type: Boolean,
      default: false,
    },
  },
  {
    // Agrega automáticamente "createdAt" y "updatedAt"
    timestamps: true,
  }
);

// Se exporta el modelo. El nombre en MongoDB será "proyectos" (en plural, en minúsculas)
export default mongoose.model('Proyecto', proyectoSchema);