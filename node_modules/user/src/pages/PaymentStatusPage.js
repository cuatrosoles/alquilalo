/* eslint-disable no-unused-vars */
// src/pages/PaymentStatusPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../services/payment.service';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const PaymentStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Obtener el ID de pago de la URL o del estado de navegación
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('payment_id') || searchParams.get('preference_id');
        
        if (!paymentId) {
          throw new Error('No se encontró el ID de pago');
        }

        // Verificar el estado del pago
        const response = await PaymentService.getPaymentStatus(paymentId);
        setPaymentStatus(response.payment);
        
      } catch (err) {
        console.error('Error al verificar el estado del pago:', err);
        setError(err.message || 'Error al verificar el estado del pago');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [location]);

  const getStatusConfig = () => {
    if (loading) {
      return {
        icon: <ClockIcon className="h-12 w-12 text-yellow-500" />,
        title: 'Verificando pago',
        message: 'Estamos verificando el estado de tu pago...',
        color: 'bg-yellow-50',
        textColor: 'text-yellow-800'
      };
    }

    if (error) {
      return {
        icon: <ExclamationCircleIcon className="h-12 w-12 text-red-500" />,
        title: 'Error',
        message: error,
        color: 'bg-red-50',
        textColor: 'text-red-800'
      };
    }

    switch (paymentStatus?.paymentStatus) {
      case 'approved':
        return {
          icon: <CheckCircleIcon className="h-12 w-12 text-green-500" />,
          title: '¡Pago Aprobado!',
          message: 'Tu pago ha sido procesado exitosamente.',
          color: 'bg-green-50',
          textColor: 'text-green-800'
        };
      case 'pending':
        return {
          icon: <ClockIcon className="h-12 w-12 text-yellow-500" />,
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Esto puede tardar unos minutos.',
          color: 'bg-yellow-50',
          textColor: 'text-yellow-800'
        };
      case 'rejected':
      case 'cancelled':
        return {
          icon: <XCircleIcon className="h-12 w-12 text-red-500" />,
          title: 'Pago Rechazado',
          message: 'No pudimos procesar tu pago. Por favor, intenta nuevamente.',
          color: 'bg-red-50',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <ExclamationCircleIcon className="h-12 w-12 text-gray-500" />,
          title: 'Estado desconocido',
          message: 'No se pudo determinar el estado del pago.',
          color: 'bg-gray-50',
          textColor: 'text-gray-800'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Estado del Pago
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Revisa el estado de tu transacción
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className={`px-4 py-5 sm:p-6 ${statusConfig.color}`}>
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0">
                {statusConfig.icon}
              </div>
              <div className="ml-4">
                <h3 className={`text-lg leading-6 font-medium ${statusConfig.textColor}`}>
                  {statusConfig.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {statusConfig.message}
                </p>
              </div>
            </div>
          </div>

          {paymentStatus && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">ID de Transacción</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {paymentStatus.id || 'N/A'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Monto</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${paymentStatus.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(paymentStatus.createdAt).toLocaleDateString('es-AR')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {paymentStatus.paymentStatus || 'No especificado'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Volver atrás
            </button>
            <button
              type="button"
              onClick={() => navigate('/mis-reservas')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ver mis reservas
            </button>
          </div>
        </div>

        {paymentStatus?.paymentStatus === 'pending' && (
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Pago en proceso</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Los pagos pueden tardar hasta 24 horas en procesarse. Te notificaremos por correo electrónico cuando se complete la transacción.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;