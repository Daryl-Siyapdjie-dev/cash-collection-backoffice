import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { operatorApi, operatorServiceApi } from '../../services/api';
import type { TelcoOperator, OperatorService } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ServiceFormModal } from './ServiceFormModal';

export const OperatorServices: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [operator, setOperator] = useState<TelcoOperator | null>(null);
  const [services, setServices] = useState<OperatorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<OperatorService | null>(null);

  useEffect(() => {
    loadOperatorAndServices();
  }, [id]);

  const loadOperatorAndServices = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [opResponse, servicesResponse] = await Promise.all([
        operatorApi.getById(id),
        operatorServiceApi.getAll({ operatorId: id, page: 1, pageSize: 100 })
      ]);

      if (opResponse.success && opResponse.data) {
        setOperator(opResponse.data);
      }

      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data.items);
      }
    } catch (error) {
      console.error('Error loading operator and services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (service: OperatorService) => {
    try {
      const response = await operatorServiceApi.update(service.id, {
        ...service,
        isEnabled: !service.isEnabled
      });

      if (response.success) {
        loadOperatorAndServices();
      }
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service?')) return;

    try {
      const response = await operatorServiceApi.delete(serviceId);
      if (response.success) {
        loadOperatorAndServices();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEditService = (service: OperatorService) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingService(null);
    loadOperatorAndServices();
  };

  if (loading || !operator) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/operators')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Services de {operator.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Gérer les services disponibles pour cet opérateur
            </p>
          </div>
        </div>
        <Button onClick={handleAddService} icon={Plus}>
          Ajouter un Service
        </Button>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {service.displayName || service.serviceType}
                  </h3>
                  <p className="text-sm text-gray-500">{service.code}</p>
                </div>
                <Badge variant={service.isEnabled ? 'success' : 'secondary'}>
                  {service.isEnabled ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Type:</span>{' '}
                  <span className="text-gray-600">{service.serviceType}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Compte:</span>{' '}
                  <span className="text-gray-600">{service.serviceAccount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  icon={service.isEnabled ? ToggleRight : ToggleLeft}
                  onClick={() => handleToggleService(service)}
                  className="flex-1"
                >
                  {service.isEnabled ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleEditService(service)}
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Aucun service configuré</h3>
            <p className="mt-2 text-gray-600">
              Commencez par ajouter un service pour cet opérateur
            </p>
            <Button onClick={handleAddService} icon={Plus} className="mt-4">
              Ajouter un Service
            </Button>
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <ServiceFormModal
          operatorId={id!}
          service={editingService}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};
