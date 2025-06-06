import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import Layout from '../components/Layout';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'USD',
    timezone: 'America/Argentina/Buenos_Aires',
    maintenanceMode: false,
    minDeposit: 0,
    maxDeposit: 0,
    minRentalDays: 1,
    maxRentalDays: 30,
    paymentMethods: [],
    notificationEmails: [],
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (updatedSettings) => {
    try {
      await updateDoc(doc(db, 'settings', 'general'), {
        ...updatedSettings,
        updatedAt: new Date(),
      });
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleAddPaymentMethod = () => {
    const newMethod = {
      name: '',
      description: '',
      active: true,
    };
    setSettings((prev) => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, newMethod],
    }));
  };

  const handleRemovePaymentMethod = (index) => {
    if (!window.confirm('¿Estás seguro de eliminar este método de pago?')) return;

    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
    }));
  };

  const handleAddNotificationEmail = () => {
    setSettings((prev) => ({
      ...prev,
      notificationEmails: [...prev.notificationEmails, ''],
    }));
  };

  const handleRemoveNotificationEmail = (index) => {
    if (!window.confirm('¿Estás seguro de eliminar este email?')) return;

    setSettings((prev) => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter((_, i) => i !== index),
    }));
  };

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuración del Sistema</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título del Sitio
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) =>
                  setSettings({ ...settings, siteTitle: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción del Sitio
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email de Contacto
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email de Soporte
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono de Soporte
              </label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) =>
                  setSettings({ ...settings, supportPhone: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Alquiler</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Moneda
              </label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zona Horaria
              </label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="America/Argentina/Buenos_Aires">
                  Argentina/Buenos Aires
                </option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Depósito Mínimo
              </label>
              <input
                type="number"
                value={settings.minDeposit}
                onChange={(e) =>
                  setSettings({ ...settings, minDeposit: Number(e.target.value) })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Depósito Máximo
              </label>
              <input
                type="number"
                value={settings.maxDeposit}
                onChange={(e) =>
                  setSettings({ ...settings, maxDeposit: Number(e.target.value) })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Días Mínimos de Alquiler
              </label>
              <input
                type="number"
                value={settings.minRentalDays}
                onChange={(e) =>
                  setSettings({ ...settings, minRentalDays: Number(e.target.value) })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Días Máximos de Alquiler
              </label>
              <input
                type="number"
                value={settings.maxRentalDays}
                onChange={(e) =>
                  setSettings({ ...settings, maxRentalDays: Number(e.target.value) })
                }
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métodos de Pago</h3>
          <div className="space-y-4">
            {settings.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={method.name}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      paymentMethods: prev.paymentMethods.map((m, i) =>
                        i === index ? { ...m, name: e.target.value } : m
                      ),
                    }))
                  }
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={method.description}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      paymentMethods: prev.paymentMethods.map((m, i) =>
                        i === index ? { ...m, description: e.target.value } : m
                      ),
                    }))
                  }
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={method.active}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      paymentMethods: prev.paymentMethods.map((m, i) =>
                        i === index ? { ...m, active: e.target.value === 'true' } : m
                      ),
                    }))
                  }
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                <button
                  onClick={() => handleRemovePaymentMethod(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              onClick={handleAddPaymentMethod}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Agregar Método de Pago
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
          <div className="space-y-4">
            {settings.notificationEmails.map((email, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notificationEmails: prev.notificationEmails.map((e, i) =>
                        i === index ? e.target.value : e
                      ),
                    }))
                  }
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => handleRemoveNotificationEmail(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              onClick={handleAddNotificationEmail}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Agregar Email de Notificación
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => handleUpdateSettings(settings)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Guardar Cambios
        </button>
      </div>
    </Layout>
  );
};

export default Settings;
