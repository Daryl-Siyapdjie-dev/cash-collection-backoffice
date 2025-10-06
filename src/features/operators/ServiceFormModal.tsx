import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, Save } from 'lucide-react';
import { operatorServiceApi } from '../../services/api';
import type { OperatorService } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ServiceFormModalProps {
  operatorId: string;
  service: OperatorService | null;
  onClose: () => void;
}

interface ServiceFormData {
  serviceType: 'AIRTIME' | 'MOBILE_MONEY' | 'SIM_CARD' | 'DATA_BUNDLE';
  serviceAccount: string;
  code?: string;
  displayName?: string;
  isEnabled: boolean;
}

const validationSchema = Yup.object({
  serviceType: Yup.string()
    .required('Le type de service est requis')
    .oneOf(['AIRTIME', 'MOBILE_MONEY', 'SIM_CARD', 'DATA_BUNDLE'], 'Type invalide'),
  serviceAccount: Yup.string()
    .required('Le compte de service est requis'),
  code: Yup.string(),
  displayName: Yup.string(),
  isEnabled: Yup.boolean()
});

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ operatorId, service, onClose }) => {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!service;

  const formik = useFormik<ServiceFormData>({
    initialValues: {
      serviceType: service?.serviceType || 'AIRTIME',
      serviceAccount: service?.serviceAccount || '',
      code: service?.code || '',
      displayName: service?.displayName || '',
      isEnabled: service?.isEnabled ?? true
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          operatorId,
          ...values
        };

        const response = isEditMode
          ? await operatorServiceApi.update(service!.id, payload)
          : await operatorServiceApi.create(payload);

        if (response.success) {
          onClose();
        }
      } catch (error) {
        console.error('Error saving service:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le Service' : 'Nouveau Service'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Service <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceType"
                value={formik.values.serviceType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="AIRTIME">Airtime</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="SIM_CARD">Carte SIM</option>
                <option value="DATA_BUNDLE">Forfait Data</option>
              </select>
              {formik.touched.serviceType && formik.errors.serviceType && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.serviceType}</p>
              )}
            </div>

            <Input
              label="Compte de Service"
              name="serviceAccount"
              placeholder="MTN-AIRTIME-001"
              value={formik.values.serviceAccount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.serviceAccount && formik.errors.serviceAccount}
              required
            />

            <Input
              label="Code"
              name="code"
              placeholder="MTN-AIR"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.code && formik.errors.code}
            />

            <Input
              label="Nom d'Affichage"
              name="displayName"
              placeholder="MTN Airtime"
              value={formik.values.displayName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.displayName && formik.errors.displayName}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isEnabled"
                id="isEnabled"
                checked={formik.values.isEnabled}
                onChange={formik.handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-900">
                Service activé
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              icon={Save}
              loading={loading}
            >
              {isEditMode ? 'Mettre à jour' : 'Créer le service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
