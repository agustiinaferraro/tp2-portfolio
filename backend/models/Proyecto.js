//modelo (esquema) de proyecto
//define que datos tiene cada proyecto del portfolio y sus tipos
import mongoose from 'mongoose';

const proyectoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
    },
    resumen: {
      //que problema habia y como se resolvio
      type: String,
      default: '',
    },
    tags: {
      //roles aplicados, ej: ["ux/ui", "full stack", "motion"]
      type: [String],
      default: [],
    },
    imagen: {
      //url de la imagen (mas adelante vendra de cloudinary)
      type: String,
      default: '',
    },
    link: {
      //url al proyecto publicado o repositorio
      type: String,
      default: '',
    },
    destacado: {
      //true = proyecto destacado, false = normal
      type: Boolean,
      default: false,
    },
  },
  {
    //agrega automaticamente "createdat" y "updatedat"
    timestamps: true,
  }
);

//se exporta el modelo. el nombre en mongodb sera "proyectos" (en plural, en minusculas)
export default mongoose.model('Proyecto', proyectoSchema);