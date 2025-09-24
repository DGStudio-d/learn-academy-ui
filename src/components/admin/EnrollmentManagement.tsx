import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useAdminEnrollments,
  useUpdateEnrollmentStatus,
  useBulkEnrollmentAction,
  useBulkEnrollmentActionWithNotes,
  useEnrollmentDetails
} from '../../hooks/useAdmin';
import type { Enrollment } from '../../types/api';

export function EnrollmentManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [viewingEnrollment, setViewingEnrollment] = useState<number | null>(null);

  const { data: enrollmentsData, isLoading, error } = useAdminEnrollments(
    currentPage, 
    statusFilter || undefined
  );
  const updateStatusMutation = useUpdateEnrollmentStatus();
  const bulkActionMutation = useBulkEnrollmentAction();
  const bulkActionWithNotesMutation = useBulkEnrollmentActionWithNotes();
  const { data: enrollmentDetails } = useEnrollmentDetails(viewingEnrollment || 0);

  const enrollments = enrollmentsData?.data?.data || [];
  const pagination = enrollmentsData?.data?.meta;

  const handleSingleAction = async (enrollmentId: number, status: 'approved' | 'rejected') => {
    try {
      await updateStatusMutation.mutateAsync({ enrollmentId, status });
      toast.success(`Enrollment ${status} successfully`);
    } catch (error: any) {
      toast.error(`Failed to ${status.slice(0, -1)} enrollment`, {
        description: error.message
      });
    }
  };

  const handleBulkAction = async () => {
    if (selectedEnrollments.length === 0) {
      toast.error('Please select enrollments first');
      return;
    }

    try {
      if (actionNotes.trim()) {
        await bulkActionWithNotesMutation.mutateAsync({
          enrollmentIds: selectedEnrollments,
          action: actionType,
          notes: actionNotes.trim()
        });
      } else {
        await bulkActionMutation.mutateAsync({
          enrollmentIds: selectedEnrollments,
          action: actionType
        });
      }
      
      toast.success(`${selectedEnrollments.length} enrollments ${actionType}d successfully`);
      setSelectedEnrollments([]);
      setIsActionDialogOpen(false);
      setActionNotes('');
    } catch (error: any) {
      toast.error(`Failed to ${actionType} enrollments`, {
        description: error.message
      });
    }
  };

  const toggleEnrollmentSelection = (enrollmentId: number) => {
    setSelectedEnrollments(prev => 
      prev.includes(enrollmentId) 
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const toggleAllEnrollments = () => {
    if (selectedEnrollments.length === enrollments.length) {
      setSelectedEnrollments([]);
    } else {
      setSelectedEnrollments(enrollments.map(enrollment => enrollment.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const openBulkActionDialog = (action: 'approve' | 'reject') => {
    if (selectedEnrollments.length === 0) {
      toast.error('Please select enrollments first');
      return;
    }
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading enrollments: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Management</h2>
          <p className="text-muted-foreground">Review and manage student enrollment requests</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedEnrollments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedEnrollments.length} enrollment(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('approve')}
                  disabled={bulkActionMutation.isPending || bulkActionWithNotesMutation.isPending}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('reject')}
                  disabled={bulkActionMutation.isPending || bulkActionWithNotesMutation.isPending}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Enrollments Found</h3>
              <p className="text-muted-foreground">
                {statusFilter || searchTerm ? 'No enrollments match your search criteria.' : 'No enrollment requests at this time.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEnrollments.length === enrollments.length}
                      onCheckedChange={toggleAllEnrollments}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEnrollments.includes(enrollment.id)}
                        onCheckedChange={() => toggleEnrollmentSelection(enrollment.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{enrollment.student?.name}</div>
                        <div className="text-sm text-muted-foreground">{enrollment.student?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{enrollment.program?.title}</div>
                        <div className="text-sm text-muted-foreground">{enrollment.program?.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {enrollment.program?.language?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(enrollment.status)}
                        {getStatusBadge(enrollment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(enrollment.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {enrollment.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSingleAction(enrollment.id, 'approved')}
                              disabled={updateStatusMutation.isPending}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSingleAction(enrollment.id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewingEnrollment(enrollment.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {enrollment.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleSingleAction(enrollment.id, 'approved')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSingleAction(enrollment.id, 'rejected')}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.from} to {pagination.to} of {pagination.total} enrollments
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
              disabled={currentPage === pagination.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Enrollments
            </DialogTitle>
            <DialogDescription>
              You are about to {actionType} {selectedEnrollments.length} enrollment(s).
              {actionType === 'reject' && ' Please provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === 'approve' ? 'Notes (Optional)' : 'Reason for Rejection'}
              </Label>
              <Textarea
                id="notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Add any notes for the approval...'
                    : 'Please explain why this enrollment is being rejected...'
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsActionDialogOpen(false);
                setActionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={bulkActionMutation.isPending || bulkActionWithNotesMutation.isPending}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {(bulkActionMutation.isPending || bulkActionWithNotesMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : actionType === 'approve' ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'} ({selectedEnrollments.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollment Details Dialog */}
      <Dialog open={!!viewingEnrollment} onOpenChange={() => setViewingEnrollment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              Complete information about this enrollment request
            </DialogDescription>
          </DialogHeader>
          {enrollmentDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student</Label>
                  <div className="mt-1">
                    <div className="font-medium">{enrollmentDetails.student?.name}</div>
                    <div className="text-sm text-muted-foreground">{enrollmentDetails.student?.email}</div>
                    {enrollmentDetails.student?.phone && (
                      <div className="text-sm text-muted-foreground">{enrollmentDetails.student?.phone}</div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Program</Label>
                  <div className="mt-1">
                    <div className="font-medium">{enrollmentDetails.program?.title}</div>
                    <div className="text-sm text-muted-foreground">{enrollmentDetails.program?.description}</div>
                    <Badge variant="outline" className="mt-1">
                      {enrollmentDetails.program?.language?.name}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    {getStatusIcon(enrollmentDetails.status)}
                    {getStatusBadge(enrollmentDetails.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Requested Date</Label>
                  <div className="mt-1 text-sm">
                    {new Date(enrollmentDetails.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {enrollmentDetails.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {enrollmentDetails.notes}
                  </div>
                </div>
              )}
              {enrollmentDetails.processed_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Processed Date</Label>
                    <div className="mt-1 text-sm">
                      {new Date(enrollmentDetails.processed_at).toLocaleString()}
                    </div>
                  </div>
                  {enrollmentDetails.processed_by && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Processed By</Label>
                      <div className="mt-1 text-sm">
                        {enrollmentDetails.processed_by.name}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingEnrollment(null)}
            >
              Close
            </Button>
            {enrollmentDetails?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleSingleAction(enrollmentDetails.id, 'approved');
                    setViewingEnrollment(null);
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleSingleAction(enrollmentDetails.id, 'rejected');
                    setViewingEnrollment(null);
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}