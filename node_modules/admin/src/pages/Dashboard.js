import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalRentals: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener estadísticas básicas
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const rentalsSnapshot = await getDocs(collection(db, 'rentals'));

        setStats({
          totalUsers: usersSnapshot.size,
          totalItems: itemsSnapshot.size,
          totalRentals: rentalsSnapshot.size,
          totalRevenue: 0, // Se calculará más adelante
        });

        // Obtener datos para el gráfico
        const paymentsSnapshot = await getDocs(
          query(
            collection(db, 'payments'),
            orderBy('createdAt', 'desc'),
            limit(6)
          )
        );

        const data = [];
        const labels = [];

        paymentsSnapshot.forEach((doc) => {
          const payment = doc.data();
          const month = new Date(payment.createdAt.toDate()).toLocaleDateString('es-ES', {
            month: 'short',
          });
          
          if (!labels.includes(month)) {
            labels.push(month);
            data.push(payment.amount);
          } else {
            const index = labels.indexOf(month);
            data[index] += payment.amount;
          }
        });

        setChartData({
          labels,
          datasets: [
            {
              label: 'Ingresos Mensuales',
              data,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cards de estadísticas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Usuarios Totales</h3>
          <p className="mt-2 text-2xl font-bold text-primary-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Items Totales</h3>
          <p className="mt-2 text-2xl font-bold text-primary-600">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Alquileres Totales</h3>
          <p className="mt-2 text-2xl font-bold text-primary-600">{stats.totalRentals}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Ingresos Totales</h3>
          <p className="mt-2 text-2xl font-bold text-primary-600">$ {stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráfico de ingresos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingresos Mensuales</h2>
        <Bar data={chartData} />
      </div>
    </Layout>
  );
};

export default Dashboard;
