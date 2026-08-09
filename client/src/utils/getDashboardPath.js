// codewizards/client/src/utils/getDashboardPath.js
const dashboardPathByRole = {
  student: "/student-dashboard",
  senior: "/senior-dashboard",
  alumni: "/alumni-dashboard",
  admin: "/admin-dashboard",
};

export const getDashboardPath = (role) => dashboardPathByRole[role] || "/dashboard";

