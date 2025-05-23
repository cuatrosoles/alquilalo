import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from 'antd';
import moment from 'moment';
import bookingService from '../services/bookingService';

const { RangePicker } = DatePicker;

const CreateBooking = ({ itemId, itemPrice }) => {
  const navigate = useNavigate();
  const [dates, setDates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDateChange = (dates) => {
    setDates(dates);
  };

  const calculateTotalPrice = () => {
    if (!dates || !dates[0] || !dates[1] || !itemPrice) return 0;
    const days = dates[1].diff(dates[0], 'days') + 1;
    return days * itemPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dates || !dates[0] || !dates[1]) {
      setError('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const booking = await bookingService.createBooking(
        itemId,
        dates[0].toISOString(),
        dates[1].toISOString()
      );
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-booking">
      <h2>Crear Reserva</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Selecciona las fechas:</label>
          <RangePicker
            onChange={handleDateChange}
            value={dates}
            disabledDate={(current) => current && current < moment().startOf('day')}
            style={{ width: '100%' }}
          />
        </div>

        {dates && dates[0] && dates[1] && (
          <div className="booking-summary">
            <p>
              Duración: {dates[1].diff(dates[0], 'days') + 1} días
            </p>
            <p>
              Precio por día: ${itemPrice}
            </p>
            <p>
              Precio total: ${calculateTotalPrice()}
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !dates}
        >
          {loading ? 'Creando reserva...' : 'Crear Reserva'}
        </button>
      </form>

      <style jsx>{`
        .create-booking {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .booking-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .error-message {
          color: #dc3545;
          margin-bottom: 15px;
        }

        .btn-primary {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn-primary:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CreateBooking; 