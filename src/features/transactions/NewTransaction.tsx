import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { transactionApi, dealerApi, operatorApi, currencyApi } from '../../services/api';
import type { Dealer, TelcoOperator, OperatorService, Currency } from '../../types';

const transactionSchema = Yup.object().shape({
  dealerId: Yup.string().required('Dealer is required'),
  depositorName: Yup.string().required('Depositor name is required'),
  operatorId: Yup.string().required('Operator is required'),
  operatorServiceId: Yup.string().required('Service is required'),
  amount: Yup.number().min(1, 'Amount must be greater than 0').required('Amount is required'),
  currencyId: Yup.string().required('Currency is required'),
  phoneNumber: Yup.string().matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  sourceOfFunds: Yup.string().required('Source of funds is required'),
});

export function NewTransaction() {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [operators, setOperators] = useState<TelcoOperator[]>([]);
  const [services, setServices] = useState<OperatorService[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedOperator) {
      fetchServices(selectedOperator);
    }
  }, [selectedOperator]);

  const fetchInitialData = async () => {
    try {
      const [dealersRes, operatorsRes, currenciesRes] = await Promise.all([
        dealerApi.getAll({ pageSize: 100 }),
        operatorApi.getAll(),
        currencyApi.getAll(),
      ]);

      if (dealersRes.success && dealersRes.data) {
        setDealers(dealersRes.data.items);
      }
      if (operatorsRes.success && operatorsRes.data) {
        setOperators(operatorsRes.data);
      }
      if (currenciesRes.success && currenciesRes.data) {
        setCurrencies(currenciesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchServices = async (operatorId: string) => {
    try {
      const response = await operatorApi.getServices(operatorId);
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const selectedService = services.find((s) => s.id === values.operatorServiceId);
      const response = await transactionApi.create({
        ...values,
        serviceType: selectedService?.serviceType || 'AIRTIME',
      });

      if (response.success) {
        alert('Transaction created successfully');
        navigate('/transactions');
      } else {
        alert(response.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('An error occurred while creating the transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/transactions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
          <p className="text-muted-foreground">Create a new cash collection transaction</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Fill in the transaction information below</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              dealerId: '',
              depositorName: '',
              operatorId: '',
              operatorServiceId: '',
              amount: '',
              currencyId: currencies.length > 0 ? currencies[0].id : '',
              phoneNumber: '',
              sourceOfFunds: '',
            }}
            validationSchema={transactionSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Dealer */}
                  <div className="space-y-2">
                    <Label htmlFor="dealerId">Dealer *</Label>
                    <Field
                      as={Select}
                      id="dealerId"
                      name="dealerId"
                      onChange={(e: any) => setFieldValue('dealerId', e.target.value)}
                    >
                      <option value="">Select Dealer</option>
                      {dealers.map((dealer) => (
                        <option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </option>
                      ))}
                    </Field>
                    {errors.dealerId && touched.dealerId && (
                      <p className="text-sm text-destructive">{errors.dealerId}</p>
                    )}
                  </div>

                  {/* Depositor Name */}
                  <div className="space-y-2">
                    <Label htmlFor="depositorName">Depositor Name *</Label>
                    <Field as={Input} id="depositorName" name="depositorName" placeholder="Enter depositor name" />
                    {errors.depositorName && touched.depositorName && (
                      <p className="text-sm text-destructive">{errors.depositorName}</p>
                    )}
                  </div>

                  {/* Operator */}
                  <div className="space-y-2">
                    <Label htmlFor="operatorId">Telco Operator *</Label>
                    <Field
                      as={Select}
                      id="operatorId"
                      name="operatorId"
                      onChange={(e: any) => {
                        setFieldValue('operatorId', e.target.value);
                        setSelectedOperator(e.target.value);
                        setFieldValue('operatorServiceId', '');
                      }}
                    >
                      <option value="">Select Operator</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.name}
                        </option>
                      ))}
                    </Field>
                    {errors.operatorId && touched.operatorId && (
                      <p className="text-sm text-destructive">{errors.operatorId}</p>
                    )}
                  </div>

                  {/* Service */}
                  <div className="space-y-2">
                    <Label htmlFor="operatorServiceId">Service *</Label>
                    <Field
                      as={Select}
                      id="operatorServiceId"
                      name="operatorServiceId"
                      disabled={!selectedOperator}
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.displayName}
                        </option>
                      ))}
                    </Field>
                    {errors.operatorServiceId && touched.operatorServiceId && (
                      <p className="text-sm text-destructive">{errors.operatorServiceId}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Field as={Input} id="amount" name="amount" type="number" placeholder="Enter amount" />
                    {errors.amount && touched.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currencyId">Currency *</Label>
                    <Field as={Select} id="currencyId" name="currencyId">
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Field>
                    {errors.currencyId && touched.currencyId && (
                      <p className="text-sm text-destructive">{errors.currencyId}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                    <Field as={Input} id="phoneNumber" name="phoneNumber" placeholder="+211..." />
                    {errors.phoneNumber && touched.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Source of Funds */}
                  <div className="space-y-2">
                    <Label htmlFor="sourceOfFunds">Source of Funds *</Label>
                    <Field as={Input} id="sourceOfFunds" name="sourceOfFunds" placeholder="e.g., Cash deposit" />
                    {errors.sourceOfFunds && touched.sourceOfFunds && (
                      <p className="text-sm text-destructive">{errors.sourceOfFunds}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
