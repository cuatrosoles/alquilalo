import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage, auth } from '../config/firebase';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FormItem = ({ isEditing }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState({
    title: '',
    description: '',
    categoryId: '',
    pricePerDay: '',
    priceType: 'daily',
    status: 'active',
    availability: 'true',
    mainImageIndex: 0,
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (isEditing) {
      const fetchItem = async () => {
        try {
          const docRef = doc(db, 'items', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setItem(docSnap.data());
            setPreviewImages(docSnap.data().images || []);
          }
        } catch (error) {
          console.error('Error fetching item:', error);
        }
      };
      fetchItem();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'items', id), {
          title: item.title,
          description: item.description,
          pricePerDay: parseInt(item.pricePerDay),
          priceType: item.priceType,
          status: item.status,
          categoryId: item.categoryId,
          availability: item.availability === 'true',
          mainImageIndex: parseInt(item.mainImageIndex) || 0,
        });
      } else {
        const docRef = await addDoc(collection(db, 'items'), {
          title: item.title,
          description: item.description,
          pricePerDay: parseInt(item.pricePerDay),
          priceType: item.priceType,
          status: item.status,
          categoryId: item.categoryId,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
          mainImageIndex: parseInt(item.mainImageIndex) || 0,
          availability: item.availability === 'true',
          images: [],
        });

        // Subir imágenes si se seleccionaron
        const imageFiles = e.target.images.files;
        if (imageFiles.length > 0) {
          const images = [];
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const storageRef = ref(storage, `items/${docRef.id}_${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            images.push(url);
          }
          await updateDoc(doc(db, 'items', docRef.id), { images });
        }
      }
      navigate('/items');
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setItem(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleImageRemove = (index) => {
    if (isEditing) {
      // No se puede eliminar imágenes existentes en modo edición
      return;
    }
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setItem(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleMainImageChange = (index) => {
    setItem(prev => ({
      ...prev,
      mainImageIndex: index
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? 'Editar Item' : 'Crear Nuevo Item'}
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Título
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => setItem({ ...item, title: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Descripción
              </label>
              <textarea
                value={item.description}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Categoría
              </label>
              <input
                type="text"
                value={item.categoryId}
                onChange={(e) => setItem({ ...item, categoryId: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Precio por día
              </label>
              <input
                type="number"
                value={item.pricePerDay}
                onChange={(e) => setItem({ ...item, pricePerDay: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo de precio
              </label>
              <select
                value={item.priceType}
                onChange={(e) => setItem({ ...item, priceType: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="daily">Diario</option>
                <option value="hourly">Por hora</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Estado
              </label>
              <select
                value={item.status}
                onChange={(e) => setItem({ ...item, status: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Disponibilidad
              </label>
              <select
                value={item.availability}
                onChange={(e) => setItem({ ...item, availability: e.target.value })}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Imágenes
              </label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => handleMainImageChange(index)}
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                        item.mainImageIndex === index
                          ? 'bg-primary-600'
                          : 'bg-gray-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    {!isEditing && (
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-10 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/items')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormItem;
