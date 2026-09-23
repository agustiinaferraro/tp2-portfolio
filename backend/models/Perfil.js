//modelo (esquema) de perfil
//define los datos publicos de la persona: nombre, titulo, imagen y contacto
//es un documento unico: se crea con valores por defecto al primer acceso y se actualiza desde el panel
import mongoose from 'mongoose';

const perfilSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      default: 'Agustina Ferraro',
    },
    titulo: {
      type: String,
      default: 'Diseñadora Multimedia & Desarrolladora Full Stack',
    },
    sobreMi: {
      type: String,
      default: '',
    },
    foto: {
      //foto de perfil en base64 (se sube desde el panel con el lapiz)
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    telefono: {
      //numero para mostrar (ej. "+54 9 11 3166-6948")
      type: String,
      default: '',
    },
    whatsapp: {
      //numero en formato internacional para el link de wa.me (ej. "5491131166948")
      type: String,
      default: '5491131166948',
    },
    redes: {
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      threads: { type: String, default: '' },
      behance: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

//se exporta el modelo. el nombre en mongodb sera "perfiles"
export default mongoose.model('Perfil', perfilSchema);