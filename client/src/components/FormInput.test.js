import { render, screen, fireEvent } from "@testing-library/react";
import FormInput from "./FormInput";

test("renders the label and forwards the value/onChange", () => {
  const handleChange = jest.fn();
  render(<FormInput label="Email" name="email" type="email" value="a@b.com" onChange={handleChange} />);

  expect(screen.getByText("Email")).toBeInTheDocument();
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("a@b.com");

  fireEvent.change(input, { target: { value: "new@b.com" } });
  expect(handleChange).toHaveBeenCalledTimes(1);
});

test("password fields are masked by default and can be revealed", () => {
  render(<FormInput label="Password" type="password" name="password" value="secret1" onChange={() => {}} />);
  const input = screen.getByDisplayValue("secret1");
  expect(input).toHaveAttribute("type", "password");

  fireEvent.click(screen.getByRole("button", { name: /show password/i }));
  expect(input).toHaveAttribute("type", "text");

  fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
  expect(input).toHaveAttribute("type", "password");
});
