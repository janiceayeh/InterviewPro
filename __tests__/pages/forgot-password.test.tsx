import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../utils/test-utils";
import ForgotPasswordPage from "@/app/(student)/(auth)/forgot-password/page";
import * as firebase from "@/lib/firebase";

jest.mock("../src/lib/firebase");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSendPasswordReset =
  firebase.sendPasswordResetEmail as jest.MockedFunction<
    typeof firebase.sendPasswordResetEmail
  >;

describe("Forgot Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render forgot password form", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByPlaceholderText(/enter your email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("should validate email format", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("should send password reset email", async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockResolvedValue(undefined);

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(
      /enter your email/i,
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalledWith(
        expect.any(Object),
        "test@example.com",
      );
    });
  });

  it("should display success message after sending reset email", async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockResolvedValue(undefined);

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it("should handle password reset errors", async () => {
    const user = userEvent.setup();
    const error = new Error("User not found");
    mockSendPasswordReset.mockRejectedValue(error);

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "nonexistent@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("should disable submit button while sending", async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("should have link back to login", () => {
    render(<ForgotPasswordPage />);
    const loginLink = screen.getByText(/back to login/i);
    expect(loginLink).toBeInTheDocument();
  });
});
