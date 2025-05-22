import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Layout from '../components/Layout';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [newFee, setNewFee] = useState({
    name: '',
    percentage: 0,
    fixedAmount: 0,
    description: '',
    active: true,
  });
  const [selectedFee, setSelectedFee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const q = query(
          collection(db, 'fees'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const feesData = [];
        querySnapshot.forEach((doc) => {
          feesData.push({ id: doc.id, ...doc.data() });
        });
        setFees(feesData);
      } catch (error) {
        console.error('Error fetching fees:', error);
      }
    };
    fetchFees();
  }, []);

  const handleAddFee = async () => {
    if (!newFee.name.trim()) return;

    try {
      await addDoc(collection(db, 'fees'), {
        ...newFee,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setNewFee({
        name: '',
        percentage: 0,
        fixedAmount: 0,
        description: '',
        active: true,
      });
      setShowAddModal(false);
      // Actualizar la lista de fees
      const q = query(collection(db, 'fees'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const feesData = [];
      querySnapshot.forEach((doc) => {
        feesData.push({ id: doc.id, ...doc.data() });
      });
      setFees(feesData);
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const handleUpdateFee = async (feeId, updatedFee) => {
    try {
      await updateDoc(doc(db, 'fees', feeId), {
        ...updatedFee,
        updatedAt: new Date(),
      });
      setFees(fees.map((fee) =>
        fee.id === feeId ? { ...fee, ...updatedFee } : fee
      ));
    } catch (error) {
      console.error('Error updating fee:', error);
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarifa?')) return;

    try {
      await deleteDoc(doc(db, 'fees', feeId));
      setFees(fees.filter((fee) => fee.id !== feeId));
    } catch (error) {
      console.error('Error deleting fee:', error);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Gestión de Tarifas</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Nueva Tarifa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Porcentaje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Fijo
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
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{fee.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{fee.percentage}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${fee.fixedAmount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    fee.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {fee.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedFee(fee);
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-900 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteFee(fee.id)}
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

      {/* Modal de edición de tarifa */}
      {showModal && selectedFee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Editar Tarifa
              </h3>
              <div className="mt-2 px-4 py-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={selectedFee.name}
                      onChange={(e) =>
                        setSelectedFee({ ...selectedFee, name: e.target.value })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Porcentaje
                    </label>
                    <input
                      type="number"
                      value={selectedFee.percentage}
                      onChange={(e) =>
                        setSelectedFee({ ...selectedFee, percentage: Number(e.target.value) })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto Fijo
                    </label>
                    <input
                      type="number"
                      value={selectedFee.fixedAmount}
                      onChange={(e) =>
                        setSelectedFee({ ...selectedFee, fixedAmount: Number(e.target.value) })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={selectedFee.description}
                      onChange={(e) =>
                        setSelectedFee({ ...selectedFee, description: e.target.value })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      value={selectedFee.active}
                      onChange={(e) =>
                        setSelectedFee({ ...selectedFee, active: e.target.value === 'true' })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleUpdateFee(selectedFee.id, selectedFee)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de agregar nueva tarifa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Nueva Tarifa
              </h3>
              <div className="mt-2 px-4 py-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newFee.name}
                      onChange={(e) =>
                        setNewFee({ ...newFee, name: e.target.value })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Porcentaje
                    </label>
                    <input
                      type="number"
                      value={newFee.percentage}
                      onChange={(e) =>
                        setNewFee({ ...newFee, percentage: Number(e.target.value) })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto Fijo
                    </label>
                    <input
                      type="number"
                      value={newFee.fixedAmount}
                      onChange={(e) =>
                        setNewFee({ ...newFee, fixedAmount: Number(e.target.value) })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={newFee.description}
                      onChange={(e) =>
                        setNewFee({ ...newFee, description: e.target.value })
                      }
                      className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddFee}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Fees;
