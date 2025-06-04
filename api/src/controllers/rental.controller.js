import { db } from '../config/firebase.js';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// Función auxiliar para verificar disponibilidad
const checkAvailability = async (itemId, startDate, endDate, startTime, endTime) => {
  const itemRef = db.collection('items').doc(itemId);
  const itemDoc = await itemRef.get();
  
  if (!itemDoc.exists) {
    throw new Error('El artículo no existe');
  }

  const item = itemDoc.data();
  
  // Verificar si el artículo tiene disponibilidad configurada
  if (!item.availability || !item.availability.days) {
    throw new Error('El artículo no tiene disponibilidad configurada');
  }

  // Convertir las fechas a objetos Date y establecer la hora a 00:00:00
  const checkStart = new Date(startDate);
  checkStart.setHours(0, 0, 0, 0);
  
  const checkEnd = new Date(endDate);
  checkEnd.setHours(23, 59, 59, 999);

  // Verificar si hay fechas bloqueadas que se superpongan
  if (item.availability.blockedDates) {
    const isBlocked = item.availability.blockedDates.some(blocked => {
      const blockedStart = new Date(blocked.startDate);
      blockedStart.setHours(0, 0, 0, 0);
      
      const blockedEnd = new Date(blocked.endDate);
      blockedEnd.setHours(23, 59, 59, 999);

      if (item.priceType === 'hourly') {
        // Para alquiler por horas, verificar también las franjas horarias
        const isDateOverlap = checkStart <= blockedEnd && checkEnd >= blockedStart;
        const isTimeOverlap = startTime <= blocked.endTime && endTime >= blocked.startTime;
        return isDateOverlap && isTimeOverlap;
      } else {
        // Para alquiler por días, solo verificar las fechas
        return checkStart <= blockedEnd && checkEnd >= blockedStart;
      }
    });

    if (isBlocked) {
      throw new Error('Las fechas seleccionadas están bloqueadas');
    }
  }

  // Verificar disponibilidad por día de la semana
  const currentDate = new Date(checkStart);
  while (currentDate <= checkEnd) {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentDate.getDay()];
    
    if (!item.availability.days[dayOfWeek]?.enabled) {
      throw new Error(`El artículo no está disponible el día ${dayOfWeek}`);
    }

    if (item.priceType === 'hourly') {
      const isTimeSlotAvailable = item.availability.days[dayOfWeek].slots.some(slot => {
        return startTime >= slot.start && endTime <= slot.end;
      });

      if (!isTimeSlotAvailable) {
        throw new Error(`La franja horaria seleccionada no está disponible el día ${dayOfWeek}`);
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return true;
};

// Crear un nuevo alquiler
const createRental = async (req, res) => {
  try {
    const { itemId, startDate, endDate, startTime, endTime, totalPrice } = req.body;
    const userId = req.user.uid;

    console.log('Datos recibidos en el controlador:', {
      itemId,
      startDate,
      endDate,
      startTime,
      endTime,
      totalPrice,
      userId
    });

    // Verificar que todos los campos requeridos estén presentes
    if (!itemId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        received: { itemId, startDate, endDate, startTime, endTime, totalPrice }
      });
    }

    // Obtener el item para verificar el tipo de alquiler
    const itemRef = db.collection('items').doc(itemId);
    const itemDoc = await itemRef.get();
    
    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'El artículo no existe' });
    }

    const item = itemDoc.data();
    console.log('Datos del item:', item);

    // Verificar horarios solo si es alquiler por horas
    if (item.priceType === 'hourly' && (!startTime || !endTime)) {
      return res.status(400).json({
        message: 'Los horarios son requeridos para alquileres por horas',
        received: { startTime, endTime }
      });
    }

    // Verificar disponibilidad
    try {
      await checkAvailability(itemId, startDate, endDate, startTime, endTime);
    } catch (error) {
      console.error('Error en checkAvailability:', error);
      return res.status(400).json({ 
        message: error.message,
        details: error.stack
      });
    }

    // Crear el alquiler con fechas sin tiempo
    const rentalData = {
      itemId,
      userId,
      ownerId: item.userId,
      startDate: startDate,
      endDate: endDate,
      startTime: startTime || null,
      endTime: endTime || null,
      totalPrice: Number(totalPrice),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creando alquiler con datos:', rentalData);

    try {
      // Crear el alquiler usando el Admin SDK
      const rentalRef = await db.collection('rentals').add(rentalData);
      console.log('Alquiler creado con ID:', rentalRef.id);
      
      // Actualizar las fechas bloqueadas del item
      const blockedDate = {
        startDate: startDate,
        endDate: endDate,
        startTime: startTime || null,
        endTime: endTime || null,
        rentalId: rentalRef.id
      };

      console.log('Fecha bloqueada a agregar:', blockedDate);

      const currentBlockedDates = item.availability?.blockedDates || [];
      console.log('Fechas bloqueadas actuales:', currentBlockedDates);

      const updatedBlockedDates = [...currentBlockedDates, blockedDate];
      console.log('Fechas bloqueadas actualizadas:', updatedBlockedDates);
      
      await itemRef.update({
        'availability.blockedDates': updatedBlockedDates
      });

      console.log('Item actualizado con nuevas fechas bloqueadas');

      res.status(201).json({
        id: rentalRef.id,
        ...rentalData
      });
    } catch (error) {
      console.error('Error al crear el alquiler en Firestore:', error);
      return res.status(500).json({ 
        message: 'Error al crear el alquiler en Firestore',
        details: error.message,
        stack: error.stack
      });
    }
  } catch (error) {
    console.error('Error al crear el alquiler:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack
    });
  }
};

// Obtener alquileres del usuario actual
const getUserRentals = async (req, res) => {
  try {
    const userId = req.user.uid;
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('userId', '==', userId)
    );
    
    const rentalsSnapshot = await getDocs(rentalsQuery);
    const rentals = [];
    
    rentalsSnapshot.forEach(doc => {
      rentals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(rentals);
  } catch (error) {
    console.error('Error al obtener los alquileres:', error);
    res.status(500).json({ message: 'Error al obtener los alquileres' });
  }
};

// Obtener alquileres de un item específico
const getItemRentals = async (req, res) => {
  try {
    const { itemId } = req.params;
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('itemId', '==', itemId)
    );
    
    const rentalsSnapshot = await getDocs(rentalsQuery);
    const rentals = [];
    
    rentalsSnapshot.forEach(doc => {
      rentals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(rentals);
  } catch (error) {
    console.error('Error al obtener los alquileres del item:', error);
    res.status(500).json({ message: 'Error al obtener los alquileres del item' });
  }
};

// Actualizar estado de un alquiler
const updateRentalStatus = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { status } = req.body;
    const userId = req.user.uid;

    const rentalRef = doc(db, 'rentals', rentalId);
    const rentalDoc = await getDoc(rentalRef);

    if (!rentalDoc.exists()) {
      return res.status(404).json({ message: 'Alquiler no encontrado' });
    }

    const rental = rentalDoc.data();

    // Verificar que el usuario sea el propietario o el inquilino
    if (rental.userId !== userId && rental.ownerId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este alquiler' });
    }

    await updateDoc(rentalRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado' });
  }
};

export {
  createRental,
  getUserRentals,
  getItemRentals,
  updateRentalStatus
};