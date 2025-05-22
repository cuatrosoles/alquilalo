// backend/seed-items.js
import admin from 'firebase-admin';
import config from './src/config/config.js';
import slugify from 'slugify';
import { faker } from '@faker-js/faker';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: config.firebaseConfig.projectId,
  });
}

const db = admin.firestore();
const itemsCollection = db.collection('items');
const usersCollection = db.collection('users'); // Necesitamos algunos userIds existentes
const categoriesCollection = db.collection('categories'); // Necesitamos algunos categoryIds existentes

const numberOfItemsToSeed = 10;

async function getRandomElement(collection) {
  const snapshot = await collection.limit(1).offset(Math.floor(Math.random() * (await collection.count().get()).data().count)).get();
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
}

async function seedItems() {
  try {
    const usersSnapshot = await usersCollection.limit(5).get(); // Obtener algunos usuarios
    const userIds = usersSnapshot.docs.map(doc => doc.id);
    const categoriesSnapshot = await categoriesCollection.limit(8).get(); // Obtener todas las categorías
    const categoryIds = categoriesSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0 || categoryIds.length === 0) {
      console.error('No hay usuarios o categorías de prueba disponibles. Asegúrate de haberlos creado primero.');
      process.exit(1);
    }

    for (let i = 0; i < numberOfItemsToSeed; i++) {
      const title = faker.commerce.productName();
      const slug = slugify(title, { lower: true, replacement: '-' });
      const randomUserId = faker.helpers.arrayElement(userIds);
      const randomCategoryId = faker.helpers.arrayElement(categoryIds);
      const price = parseFloat(faker.commerce.price(10, 100, 0));
      const deposit = faker.datatype.boolean() ? parseFloat(faker.commerce.price(5, 50, 0)) : 0;
      const latitude = parseFloat(faker.address.latitude());
      const longitude = parseFloat(faker.address.longitude());
      const startDate = faker.date.future();
      const endDate = faker.date.future(1, startDate);
      const imageUrls = [
        `https://picsum.photos/seed/${slug}-1/600/400`,
        `https://picsum.photos/seed/${slug}-2/600/400`,
      ];

      const newItem = {
        userId: randomUserId,
        categoryId: randomCategoryId,
        title: title,
        slug: slug,
        description: faker.commerce.productDescription(),
        pricePerDay: price,
        depositAmount: deposit,
        location: faker.address.city(),
        latitude: latitude,
        longitude: longitude,
        availabilityStart: startDate,
        availabilityEnd: endDate,
        isAvailable: faker.datatype.boolean(),
        images: imageUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await itemsCollection.add(newItem);
      console.log(`Artículo '${title}' creado.`);
    }

    console.log('¡Artículos de prueba creados exitosamente!');
    process.exit();
  } catch (error) {
    console.error('Error al crear los artículos:', error);
    process.exit(1);
  }
}

seedItems();