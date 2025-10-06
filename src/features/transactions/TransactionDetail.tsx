import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { transactionApi } from '../../services/api';
import type { Transaction, TransactionApproval } from '../../types';

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [approvals, setApprovals] = useState<TransactionApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTransactionDetails();
    }
  }, [id]);

  const fetchTransactionDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [transactionResponse, approvalsResponse] = await Promise.all([
        transactionApi.getById(id),
        transactionApi.getApprovals(id),
      ]);

      if (transactionResponse.success && transactionResponse.data) {
        setTransaction(transactionResponse.data);
      }

      if (approvalsResponse.success && approvalsResponse.data) {
        setApprovals(approvalsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (level: number) => {
    if (!id) return;

    setActionLoading(true);
    try {
      const response = await transactionApi.approve(id, level);
      if (response.success) {
        await fetchTransactionDetails();
        alert('Transaction approved successfully');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Failed to approve transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await transactionApi.reject(id, rejectReason);
      if (response.success) {
        await fetchTransactionDetails();
        setShowRejectForm(false);
        setRejectReason('');
        alert('Transaction rejected');
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Failed to reject transaction');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Transaction not found</p>
          <Button className="mt-4" onClick={() => navigate('/transactions')}>
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      PENDING: { variant: 'warning', label: 'Pending', icon: Clock },
      VALIDATED: { variant: 'default', label: 'Validated', icon: CheckCircle },
      APPROVED: { variant: 'success', label: 'Approved', icon: CheckCircle },
      COMPLETED: { variant: 'success', label: 'Completed', icon: CheckCircle },
      REJECTED: { variant: 'destructive', label: 'Rejected', icon: XCircle },
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canApproveLevel1 = transaction.status === 'PENDING';
  const canApproveLevel2 = transaction.status === 'VALIDATED';
  const canReject = transaction.status === 'PENDING' || transaction.status === 'VALIDATED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/transactions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
          <p className="text-muted-foreground">{transaction.reference}</p>
        </div>
        {getStatusBadge(transaction.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Information */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
            <CardDescription>Basic transaction details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Reference</Label>
                <p className="font-medium">{transaction.reference}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="text-xl font-bold text-primary">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Service Type</Label>
                <p className="font-medium capitalize">{transaction.serviceType.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Depositor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Depositor Information</CardTitle>
            <CardDescription>Details about the person making the deposit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{transaction.depositorName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="font-medium">{transaction.phoneNumber || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Source of Funds</Label>
                <p className="font-medium">{transaction.sourceOfFunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealer & Agent Information */}
        <Card>
          <CardHeader>
            <CardTitle>Dealer & Agent</CardTitle>
            <CardDescription>Collection point details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Dealer</Label>
                <p className="font-medium">{transaction.dealer?.name || `Dealer ${transaction.dealerId}`}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Agent</Label>
                <p className="font-medium">
                  {transaction.agent?.name || (transaction.agentId ? `Agent ${transaction.agentId}` : 'Counter')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operator Information */}
        <Card>
          <CardHeader>
            <CardTitle>Operator Information</CardTitle>
            <CardDescription>Telco operator details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Operator</Label>
                <p className="font-medium">{transaction.operator?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Service</Label>
                <p className="font-medium">{transaction.operatorService?.displayName || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval History */}
      {approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
            <CardDescription>Transaction approval workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <div key={approval.id} className="flex items-start gap-4 border-l-2 border-primary pl-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Level {approval.level} - {approval.approverRole}
                      </p>
                      <Badge variant={approval.action === 'APPROVE' ? 'success' : 'destructive'}>
                        {approval.action}
                      </Badge>
                    </div>
                    {approval.comment && <p className="text-sm text-muted-foreground mt-1">{approval.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(approval.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {(canApproveLevel1 || canApproveLevel2 || canReject) && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Review and approve or reject this transaction</CardDescription>
          </CardHeader>
          <CardContent>
            {!showRejectForm ? (
              <div className="flex gap-4">
                {canApproveLevel1 && (
                  <Button onClick={() => handleApprove(1)} disabled={actionLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve (Level 1)
                  </Button>
                )}
                {canApproveLevel2 && (
                  <Button onClick={() => handleApprove(2)} disabled={actionLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve (Level 2)
                  </Button>
                )}
                {canReject && (
                  <Button variant="destructive" onClick={() => setShowRejectForm(true)} disabled={actionLoading}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectReason">Rejection Reason</Label>
                  <Input
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-4">
                  <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
                    Confirm Rejection
                  </Button>
                  <Button variant="outline" onClick={() => setShowRejectForm(false)} disabled={actionLoading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
