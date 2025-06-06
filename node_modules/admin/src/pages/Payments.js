import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
} from 'firebase/firestore';
import Layout from '../components/Layout';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const q = query(
          collection(db, 'payments'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const paymentsData = [];
        querySnapshot.forEach((doc) => {
          paymentsData.push({ id: doc.id, ...doc.data() });
        });
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      setPayments(payments.map((payment) =>
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const filteredPayments = payments.filter((payment) =>
    payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.rentalId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Gestión de Pagos</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar pagos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alquiler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.userEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.rentalId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${payment.amount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(payment.createdAt?.toDate()).toLocaleDateString('es-ES')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-900 mr-2"
                  >
                    Ver Detalles
                  </button>
                  <select
                    onChange={(e) => handleUpdateStatus(payment.id, e.target.value)}
                    className="px-2 py-1 border rounded-md"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completado</option>
                    <option value="failed">Fallido</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles del pago */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Detalles del Pago
              </h3>
              <div className="mt-2 px-4 py-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información del Pago</h4>
                    <p className="text-sm text-gray-500">
                      <strong>Usuario:</strong> {selectedPayment.userEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Alquiler:</strong> {selectedPayment.rentalId}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Monto:</strong> ${selectedPayment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Método:</strong> {selectedPayment.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Estado:</strong> {selectedPayment.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Fecha:</strong>{' '}
                      {new Date(selectedPayment.createdAt?.toDate()).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Información del Item</h4>
                    <p className="text-sm text-gray-500">
                      <strong>Item:</strong> {selectedPayment.itemName}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Categoría:</strong> {selectedPayment.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Período:</strong>{' '}
                      {new Date(selectedPayment.startDate?.toDate()).toLocaleDateString('es-ES')} -
                      {new Date(selectedPayment.endDate?.toDate()).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Información de la Tarjeta</h4>
                  <p className="text-sm text-gray-500">
                    <strong>Tipo:</strong> {selectedPayment.cardType}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Últimos 4 dígitos:</strong>{' '}
                    {selectedPayment.last4Digits}
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Payments;
