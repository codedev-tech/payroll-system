const AUTH_USER_KEY = 'auth_user';

export function setAuthUser(userPayload) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userPayload));
}

export function getAuthUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getActorUserId() {
  const authUser = getAuthUser();
  return authUser?.id ? Number(authUser.id) : null;
}

export function getActorRole() {
  const authUser = getAuthUser();
  return authUser?.role || null;
}

export function getActorEmployeeId() {
  const authUser = getAuthUser();
  return authUser?.employee_profile?.id ? Number(authUser.employee_profile.id) : null;
}

export function isHrOrAdmin() {
  const role = getActorRole();
  return role === 'hr' || role === 'admin';
}
