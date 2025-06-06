import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import bookingService from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

const BookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Error al cargar los detalles de la reserva');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      accepted: '#28a745',
      rejected: '#dc3545',
      ongoing: '#17a2b8',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const isOwner = user && booking && user.uid === booking.ownerId;

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!booking) {
    return <div className="not-found">Reserva no encontrada</div>;
  }

  return (
    <div className="booking-details">
      <h2>Detalles de la Reserva</h2>
      
      <div className="booking-info">
        <div className="info-section">
          <h3>Información General</h3>
          <p>
            <strong>Estado:</strong>{' '}
            <span style={{ color: getStatusColor(booking.bookingStatus) }}>
              {booking.bookingStatus.toUpperCase()}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{' '}
            {moment(booking.createdAt).format('DD/MM/YYYY HH:mm')}
          </p>
        </div>

        <div className="info-section">
          <h3>Fechas</h3>
          <p>
            <strong>Inicio:</strong>{' '}
            {moment(booking.startDate).format('DD/MM/YYYY')}
            {booking.startTime && ` ${booking.startTime}`}
          </p>
          <p>
            <strong>Fin:</strong>{' '}
            {moment(booking.endDate).format('DD/MM/YYYY')}
            {booking.endTime && ` ${booking.endTime}`}
          </p>
          <p>
            <strong>Duración:</strong>{' '}
            {moment(booking.endDate).diff(moment(booking.startDate), 'days') + 1} días
          </p>
        </div>

        <div className="info-section">
          <h3>Precios</h3>
          <p>
            <strong>Precio total:</strong> ${booking.totalPrice.toFixed(2)}
          </p>
          <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Depósito en Garantía</h4>
            <div className="space-y-1 text-sm text-yellow-700">
              <p>• Monto del depósito: ${booking.depositAmount.toFixed(2)}</p>
              {isOwner && (
                <>
                  <p>• Fee de la plataforma: ${booking.platformFee.toFixed(2)}</p>
                  <p className="font-semibold">• Monto a recibir: ${booking.ownerReceivesAmount.toFixed(2)}</p>
                </>
              )}
              {!isOwner && (
                <p className="font-semibold">• Monto a abonar: ${booking.finalDepositAmount.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Estado del Pago</h3>
          <p>
            <strong>Estado:</strong>{' '}
            <span className={`px-2 py-1 rounded-full text-xs ${
              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .booking-details {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .booking-info {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-top: 20px;
        }

        .info-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .info-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        h2 {
          color: #333;
          margin-bottom: 20px;
        }

        h3 {
          color: #666;
          margin-bottom: 15px;
        }

        p {
          margin: 8px 0;
          color: #444;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .error-message {
          color: #dc3545;
          text-align: center;
          padding: 20px;
        }

        .not-found {
          text-align: center;
          padding: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default BookingDetails; 