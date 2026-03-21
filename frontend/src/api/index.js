export { usersApi } from './resources/users';
export { employeesApi } from './resources/employees';
export { authApi } from './resources/auth';
export { departmentsApi } from './resources/departments';
export { hrEmployeeAccountsApi } from './resources/hrEmployeeAccounts';
export { payslipsApi } from './resources/payslips';
export { analyticsApi } from './resources/analytics';
export { payrollSettingsApi } from './resources/payrollSettings';
export { leaveRequestsApi } from './resources/leaveRequests';
export { leaveTypesApi } from './resources/leaveTypes';
export { attendanceApi } from './resources/attendance';
// Export other resources here as they are created
// export { payrollApi } from './resources/payroll';

export { extractData, extractMeta } from './utils';
export { default as apiClient } from './client';
