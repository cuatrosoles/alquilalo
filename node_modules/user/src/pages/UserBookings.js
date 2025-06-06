import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import bookingService from '../services/bookingService';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getUserBookings();
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Error al cargar las reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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

  if (loading) {
    return <div className="loading">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-bookings">
      <h2>Mis Reservas</h2>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No tienes reservas activas</p>
          <Link to="/items" className="btn btn-primary">
            Explorar artículos
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <Link
              to={`/bookings/${booking.id}`}
              key={booking.id}
              className="booking-card"
            >
              <div className="booking-header">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(booking.bookingStatus) }}
                >
                  {booking.bookingStatus.toUpperCase()}
                </span>
                <span className="booking-date">
                  {moment(booking.createdAt).format('DD/MM/YYYY')}
                </span>
              </div>

              <div className="booking-dates">
                <p>
                  <strong>Inicio:</strong>{' '}
                  {moment(booking.startDate).format('DD/MM/YYYY')}
                </p>
                <p>
                  <strong>Fin:</strong>{' '}
                  {moment(booking.endDate).format('DD/MM/YYYY')}
                </p>
              </div>

              <div className="booking-footer">
                <span className="total-price">
                  ${booking.totalPrice}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .user-bookings {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        h2 {
          color: #333;
          margin-bottom: 30px;
        }

        .bookings-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .booking-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
        }

        .booking-card:hover {
          transform: translateY(-2px);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .booking-date {
          color: #666;
          font-size: 14px;
        }

        .booking-dates {
          margin-bottom: 15px;
        }

        .booking-dates p {
          margin: 5px 0;
          color: #444;
        }

        .booking-footer {
          border-top: 1px solid #eee;
          padding-top: 15px;
          display: flex;
          justify-content: flex-end;
        }

        .total-price {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error-message {
          color: #dc3545;
          text-align: center;
          padding: 40px;
        }

        .no-bookings {
          text-align: center;
          padding: 40px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .no-bookings p {
          margin-bottom: 20px;
          color: #666;
        }

        .btn-primary {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.2s;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default UserBookings; 