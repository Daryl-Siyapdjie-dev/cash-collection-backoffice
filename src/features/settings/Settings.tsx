import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, DollarSign, Sliders } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'commission', label: 'Commissions', icon: DollarSign },
    { id: 'limits', label: 'Limites', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérer les paramètres de l'application</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <Card title="Paramètres Généraux" icon={SettingsIcon}>
          <div className="space-y-6">
            <Input
              label="Nom de l'Application"
              value="Digital Cash Collection"
              readOnly
            />
            <Input
              label="Devise par Défaut"
              value="SSP - South Sudanese Pound"
              readOnly
            />
            <Input
              label="Fuseau Horaire"
              value="Africa/Juba"
              readOnly
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Langue
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card title="Notifications" icon={Bell}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications Email</p>
                <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alertes de Transaction</p>
                <p className="text-sm text-gray-500">Alertes pour les nouvelles transactions</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Rappels d'Approbation</p>
                <p className="text-sm text-gray-500">Rappels pour les transactions en attente</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card title="Sécurité" icon={Shield}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée de Session (minutes)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tentatives de Connexion Maximum
              </label>
              <input
                type="number"
                defaultValue={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Authentification à Deux Facteurs</p>
                <p className="text-sm text-gray-500">Activer 2FA pour tous les utilisateurs</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'commission' && (
        <Card title="Taux de Commission" icon={DollarSign}>
          <div className="space-y-6">
            <Input
              label="Commission Agent (%)"
              type="number"
              defaultValue="2.5"
              step="0.1"
            />
            <Input
              label="Commission Dealer (%)"
              type="number"
              defaultValue="1.5"
              step="0.1"
            />
            <Input
              label="Commission Opérateur (%)"
              type="number"
              defaultValue="0.5"
              step="0.1"
            />
          </div>
        </Card>
      )}

      {activeTab === 'limits' && (
        <Card title="Limites de Transaction" icon={Sliders}>
          <div className="space-y-6">
            <Input
              label="Montant Minimum (SSP)"
              type="number"
              defaultValue="100"
            />
            <Input
              label="Montant Maximum par Transaction (SSP)"
              type="number"
              defaultValue="1000000"
            />
            <Input
              label="Montant Maximum Journalier (SSP)"
              type="number"
              defaultValue="5000000"
            />
            <Input
              label="Nombre Maximum de Transactions par Jour"
              type="number"
              defaultValue="100"
            />
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          Enregistrer les Modifications
        </Button>
      </div>
    </div>
  );
};
