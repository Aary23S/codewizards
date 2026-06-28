const dashboardPathByRole = {
  student: "/student-dashboard",
  senior: "/senior-dashboard",
  alumni: "/alumni-dashboard",
  admin: "/admin",
};

export const getDashboardPath = (role) => dashboardPathByRole[role] || "/dashboard";

