import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RentalStats = ({ rentals, stats }) => {
  // Preparar datos para el gráfico de ingresos mensuales
  const monthlyEarnings = rentals.reduce((acc, rental) => {
    if (rental.status === "completed") {
      const month = new Date(rental.startDate).toLocaleString("es-ES", {
        month: "long",
      });
      const amount =
        rental.ownerId === rental.userId
          ? rental.totalPrice - rental.totalPrice * 0.1
          : -rental.totalPrice;

      acc[month] = (acc[month] || 0) + amount;
    }
    return acc;
  }, {});

  const earningsData = {
    labels: Object.keys(monthlyEarnings),
    datasets: [
      {
        label: "Ingresos Netos",
        data: Object.values(monthlyEarnings),
        borderColor: "#009688",
        backgroundColor: "rgba(0, 150, 136, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Preparar datos para el gráfico de estado de alquileres
  const rentalStatus = rentals.reduce((acc, rental) => {
    acc[rental.status] = (acc[rental.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = {
    labels: Object.keys(rentalStatus).map((status) => {
      switch (status) {
        case "pending_payment":
          return "Pago Pendiente";
        case "pending":
          return "Pendiente";
        case "in_progress":
          return "En Progreso";
        case "completed":
          return "Completado";
        case "cancelled":
          return "Cancelado";
        default:
          return status;
      }
    }),
    datasets: [
      {
        data: Object.values(rentalStatus),
        backgroundColor: [
          "#FFC107", // Pago Pendiente
          "#2196F3", // Pendiente
          "#4CAF50", // En Progreso
          "#9E9E9E", // Completado
          "#F44336", // Cancelado
        ],
      },
    ],
  };

  // Preparar datos para el gráfico de categorías más alquiladas
  const categoryStats = rentals.reduce((acc, rental) => {
    if (rental.itemInfo?.category) {
      acc[rental.itemInfo.category] = (acc[rental.itemInfo.category] || 0) + 1;
    }
    return acc;
  }, {});

  const categoryData = {
    labels: Object.keys(categoryStats),
    datasets: [
      {
        label: "Alquileres por Categoría",
        data: Object.values(categoryStats),
        backgroundColor: "rgba(0, 150, 136, 0.5)",
        borderColor: "#009688",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Total Alquileres
          </h3>
          <p className="text-3xl font-bold text-[#009688]">
            {stats.totalRentals}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Alquileres Activos
          </h3>
          <p className="text-3xl font-bold text-[#FFC107]">
            {stats.activeRentals}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Ganancias Totales
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(stats.totalEarnings)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Rating Promedio
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.averageRating.toFixed(1)}/5
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gráfico de ingresos mensuales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ingresos Mensuales
          </h3>
          <Line data={earningsData} options={chartOptions} />
        </div>

        {/* Gráfico de estado de alquileres */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Estado de Alquileres
          </h3>
          <div className="h-64">
            <Doughnut data={statusData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico de categorías */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Categorías Más Alquiladas
          </h3>
          <Bar data={categoryData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default RentalStats;
