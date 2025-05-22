// backend/seed-categories.js
import admin from 'firebase-admin';
import config from './src/config/config.js';
import slugify from 'slugify';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: config.firebaseConfig.projectId,
  });
}

const db = admin.firestore();
const categoriesCollection = db.collection('categories');

const categoriesToSeed = [
  { name: 'Fotografía' },
  { name: 'Herramientas' },
  { name: 'Eventos' },
  { name: 'Deportes' },
  { name: 'Hogar y Jardín' },
  { name: 'Moda' },
  { name: 'Electrónica' },
  { name: 'Otros' },
];

async function seedCategories() {
  try {
    for (const category of categoriesToSeed) {
      const slug = slugify(category.name, { lower: true, replacement: '-' });
      const newCategory = { ...category, slug, createdAt: new Date(), updatedAt: new Date() };
      await categoriesCollection.add(newCategory);
      console.log(`Categoría '${category.name}' creada.`);
    }
    console.log('¡Categorías de prueba creadas exitosamente!');
    process.exit();
  } catch (error) {
    console.error('Error al crear las categorías:', error);
    process.exit(1);
  }
}

seedCategories();