import apiClient from '../client';

class AttendanceResource {
  list(params = {}) {
    return apiClient.get('/attendance', { params });
  }

  clockIn(data) {
    return apiClient.post('/attendance/clock-in', data);
  }

  clockOut(data) {
    return apiClient.post('/attendance/clock-out', data);
  }

  kioskClockIn(data) {
    return apiClient.post('/attendance/kiosk/clock-in', data);
  }

  kioskClockOut(data) {
    return apiClient.post('/attendance/kiosk/clock-out', data);
  }
}

export const attendanceApi = new AttendanceResource();
