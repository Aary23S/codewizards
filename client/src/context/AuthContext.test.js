import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { getMe, logoutUser } from "../services/api";

jest.mock("../services/api", () => ({
  getMe: jest.fn(),
  logoutUser: jest.fn(),
}));

const Consumer = () => {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <p>loading</p>;
  return (
    <div>
      <p>{user ? `logged in as ${user.name}` : "logged out"}</p>
      <button onClick={() => login("tok", { name: "Ada", role: "student" })}>do-login</button>
      <button onClick={logout}>do-logout</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  getMe.mockRejectedValue(new Error("no session"));
});

test("starts logged out when there is no stored token", async () => {
  renderWithProvider();
  await screen.findByText("logged out");
  expect(getMe).not.toHaveBeenCalled();
});

test("login() stores the token and updates the user", async () => {
  renderWithProvider();
  await screen.findByText("logged out");

  fireEvent.click(screen.getByText("do-login"));

  expect(await screen.findByText("logged in as Ada")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBe("tok");
});

test("logout() clears the token even if the server call fails", async () => {
  logoutUser.mockRejectedValue(new Error("network down"));
  renderWithProvider();
  await screen.findByText("logged out");

  fireEvent.click(screen.getByText("do-login"));
  await screen.findByText("logged in as Ada");

  fireEvent.click(screen.getByText("do-logout"));

  expect(await screen.findByText("logged out")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
});

test("loads the user from an existing token on mount", async () => {
  localStorage.setItem("token", "existing-token");
  getMe.mockResolvedValue({ data: { data: { name: "Grace", role: "senior" } } });

  renderWithProvider();

  expect(await screen.findByText("logged in as Grace")).toBeInTheDocument();
  expect(getMe).toHaveBeenCalledTimes(1);
});
