import { render, screen } from "@testing-library/react";
import Home from "./pages/Home";

test("renders smart campus dashboard", () => {
  render(<Home />);
  expect(screen.getByText(/smart campus dashboard/i)).toBeInTheDocument();
});
