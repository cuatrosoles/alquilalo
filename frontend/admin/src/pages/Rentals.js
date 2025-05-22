import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Rentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const q = query(
          collection(db, 'rentals'),
          orderBy('startDate', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const rentalsData = [];
        querySnapshot.forEach((doc) => {
          rentalsData.push({ id: doc.id, ...doc.data() });
        });
        setRentals(rentalsData);
      } catch (error) {
        console.error('Error fetching rentals:', error);
      }
    };
    fetchRentals();
  }, []);

  const handleDeleteRental = async (rentalId) => {
    if (!window.confirm('¿Estás seguro de eliminar este alquiler?')) return;

    try {
      await deleteDoc(doc(db, 'rentals', rentalId));
      setRentals(rentals.filter(rental => rental.id !== rentalId));
    } catch (error) {
      console.error('Error deleting rental:', error);
    }
  };

  const handleEditRental = (rentalId) => {
    navigate(`/rentals/${rentalId}/edit`);
  };

  const handleAddRental = () => {
    navigate('/rentals/new');
  };

  const filteredRentals = rentals.filter(rental => 
    rental.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Alquileres</h1>
          <button
            onClick={handleAddRental}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Agregar Alquiler
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar alquileres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded my-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rental.itemId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rental.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(rental.startDate), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(rental.endDate), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rental.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : rental.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditRental(rental.id)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteRental(rental.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Rentals;
