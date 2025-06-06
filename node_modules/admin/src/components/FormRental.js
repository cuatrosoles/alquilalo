import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import Layout from '../components/Layout';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

const FormRental = ({ isEditing }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rental, setRental] = useState({
    itemId: '',
    userId: '',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchRental = async () => {
        try {
          const docRef = doc(db, 'rentals', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRental(docSnap.data());
          }
        } catch (error) {
          console.error('Error fetching rental:', error);
        }
      };
      fetchRental();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const docRef = doc(db, 'rentals', id);
        await updateDoc(docRef, rental);
      } else {
        await addDoc(collection(db, 'rentals'), {
          ...rental,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/rentals');
    } catch (error) {
      console.error('Error saving rental:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate' || name === 'endDate') {
      try {
        const date = parse(value, 'dd/MM/yyyy', new Date());
        if (!isNaN(date.getTime())) {
          setRental({
            ...rental,
            [name]: date.toISOString()
          });
        }
      } catch (error) {
        console.error('Invalid date format:', error);
      }
    } else {
      setRental({
        ...rental,
        [name]: value
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Alquiler' : 'Nuevo Alquiler'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID del Item
            </label>
            <input
              type="text"
              name="itemId"
              value={rental.itemId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID del Usuario
            </label>
            <input
              type="text"
              name="userId"
              value={rental.userId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Inicio
            </label>
            <input
              type="text"
              name="startDate"
              value={rental.startDate ? format(new Date(rental.startDate), 'dd/MM/yyyy', { locale: es }) : ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              placeholder="dd/mm/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Fin
            </label>
            <input
              type="text"
              name="endDate"
              value={rental.endDate ? format(new Date(rental.endDate), 'dd/MM/yyyy', { locale: es }) : ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              placeholder="dd/mm/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="status"
              value={rental.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="pending">Pendiente</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              name="notes"
              value={rental.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows="3"
            />
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FormRental;
