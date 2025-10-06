import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { dealerApi, zoneApi } from '../../services/api';
import type { Zone } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface DealerFormData {
  type: 'DISTRIBUTOR' | 'RESELLER';
  name: string;
  zoneId: string;
  accountNumber: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  contractReference?: string;
}

const validationSchema = Yup.object({
  type: Yup.string()
    .required('Le type est requis')
    .oneOf(['DISTRIBUTOR', 'RESELLER'], 'Type invalide'),
  name: Yup.string()
    .required('Le nom est requis')
    .min(3, 'Minimum 3 caractères'),
  zoneId: Yup.string()
    .required('La zone est requise'),
  accountNumber: Yup.string()
    .required('Le numéro de compte est requis')
    .matches(/^[0-9]{4}-DEALER-[0-9]{3}$/, 'Format: XXXX-DEALER-XXX (ex: 3001-DEALER-001)'),
  kycStatus: Yup.string()
    .required('Le statut KYC est requis')
    .oneOf(['VERIFIED', 'PENDING', 'REJECTED'], 'Statut invalide'),
  contractReference: Yup.string()
});

export const DealerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    loadZones();
    if (isEditMode) {
      loadDealer();
    }
  }, [id]);

  const loadZones = async () => {
    try {
      const response = await zoneApi.getAll({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setZones(response.data.items);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const loadDealer = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await dealerApi.getById(id);
      if (response.success && response.data) {
        const dealer = response.data;
        formik.setValues({
          type: dealer.type,
          name: dealer.name,
          zoneId: dealer.zoneId,
          accountNumber: dealer.accountNumber,
          kycStatus: dealer.kycStatus,
          contractReference: dealer.contractReference || ''
        });
      }
    } catch (error) {
      console.error('Error loading dealer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<DealerFormData>({
    initialValues: {
      type: 'DISTRIBUTOR',
      name: '',
      zoneId: '',
      accountNumber: '',
      kycStatus: 'PENDING',
      contractReference: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = isEditMode
          ? await dealerApi.update(id!, values)
          : await dealerApi.create(values);

        if (response.success) {
          navigate('/dealers');
        }
      } catch (error) {
        console.error('Error saving dealer:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/dealers')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier le Dealer' : 'Nouveau Dealer'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Modifier les informations du dealer' : 'Créer un nouveau dealer'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <Card title="Informations du Dealer" icon={Building2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="DISTRIBUTOR">Distributeur</option>
                <option value="RESELLER">Revendeur</option>
              </select>
              {formik.touched.type && formik.errors.type && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.type}</p>
              )}
            </div>

            <Input
              label="Nom du Dealer"
              name="name"
              placeholder="Ex: Afriland Distributeur Central"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone <span className="text-red-500">*</span>
              </label>
              <select
                name="zoneId"
                value={formik.values.zoneId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionner une zone</option>
                {(zones || []).map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.code})
                  </option>
                ))}
              </select>
              {formik.touched.zoneId && formik.errors.zoneId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.zoneId}</p>
              )}
            </div>

            <Input
              label="Numéro de Compte"
              name="accountNumber"
              placeholder="3001-DEALER-001"
              value={formik.values.accountNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.accountNumber && formik.errors.accountNumber}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut KYC <span className="text-red-500">*</span>
              </label>
              <select
                name="kycStatus"
                value={formik.values.kycStatus}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="PENDING">En Attente</option>
                <option value="VERIFIED">Vérifié</option>
                <option value="REJECTED">Rejeté</option>
              </select>
              {formik.touched.kycStatus && formik.errors.kycStatus && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.kycStatus}</p>
              )}
            </div>

            <Input
              label="Référence Contrat"
              name="contractReference"
              placeholder="DEALER-JUB-2024-001"
              value={formik.values.contractReference}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.contractReference && formik.errors.contractReference}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dealers')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            icon={Save}
            loading={loading}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer le dealer'}
          </Button>
        </div>
      </form>
    </div>
  );
};
