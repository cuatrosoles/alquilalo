// src/pages/PaymentHistoryPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PaymentService from '../services/payment.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const PaymentHistoryPage = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await PaymentService.getUserPayments(
          currentUser.uid,
          filter,
          rowsPerPage,
          page * rowsPerPage
        );
        
        setPayments(response.payments || []);
        setTotalPayments(response.count || 0);
      } catch (err) {
        console.error('Error al obtener el historial de pagos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser, filter, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircleIcon,
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: ClockIcon,
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircleIcon,
      },
      refunded: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: ArrowPathIcon,
      },
    };

    const config = statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: BanknotesIcon,
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'completed' ? 'Completado' : 
         status === 'pending' ? 'Pendiente' : 
         status === 'failed' ? 'Fallido' : 
         status === 'refunded' ? 'Reembolsado' : status}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const iconConfig = {
      payment: {
        icon: ArrowDownTrayIcon,
        color: 'text-green-600',
      },
      withdrawal: {
        icon: ArrowUpTrayIcon,
        color: 'text-red-600',
      },
      refund: {
        icon: ArrowPathIcon,
        color: 'text-blue-600',
      },
    };

    const config = iconConfig[type] || {
      icon: BanknotesIcon,
      color: 'text-gray-600',
    };

    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Historial de Pagos
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Revisa el historial de tus transacciones y pagos realizados.
            </p>
          </div>
          <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Filtros</h3>
              <div className="mt-3 sm:mt-0">
                <div className="flex flex-wrap gap-2">
                  {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilter(status === 'all' ? 'all' : status)}
                      className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                        filter === status || (status === 'all' && filter === 'all')
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status === 'completed' ? 'Completados' : 
                       status === 'pending' ? 'Pendientes' : 
                       status === 'failed' ? 'Fallidos' : 
                       status === 'refunded' ? 'Reembolsos' : 'Todos'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de pagos */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transacción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No se encontraron transacciones
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getTypeIcon(payment.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.id.substring(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.type === 'payment' ? 'Pago' : 
                               payment.type === 'withdrawal' ? 'Retiro' : 
                               payment.type === 'refund' ? 'Reembolso' : payment.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{payment.description}</div>
                        <div className="text-sm text-gray-500">{payment.propertyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          payment.type === 'payment' ? 'text-green-600' : 
                          payment.type === 'withdrawal' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {payment.type === 'withdrawal' ? '-' : ''}{formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/pagos/${payment.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Ver detalles
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{page * rowsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min((page + 1) * rowsPerPage, totalPayments)}
                  </span>{' '}
                  de <span className="font-medium">{totalPayments}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.ceil(totalPayments / rowsPerPage) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === i
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(prev => Math.min(Math.ceil(totalPayments / rowsPerPage) - 1, prev + 1))}
                    disabled={page >= Math.ceil(totalPayments / rowsPerPage) - 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page >= Math.ceil(totalPayments / rowsPerPage) - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;