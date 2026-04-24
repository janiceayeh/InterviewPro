import React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../utils/test-utils";
import ForgotPasswordPage from "@/app/(student)/(auth)/forgot-password/page";
import { routes } from "@/lib/routes";
import { sendPasswordResetEmail } from "firebase/auth";

describe("Forgot Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render forgot password form", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("Reset Your Password")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Enter your email address and we will send you a link to reset your password",
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Send Reset Link" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });

  it("should render the back to login link with the correct href", async () => {
    render(<ForgotPasswordPage />);
    const loginLink = screen.getByText("Back to Login");
    expect(loginLink).toBeInTheDocument();
    expect((loginLink as HTMLAnchorElement).pathname).toBe(routes.userLogin());
  });

  it("should show invalid email error when no/invalid email is provided before send reset link button is clicked", async () => {
    render(<ForgotPasswordPage />);
    const ResetLinkButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    const EmailInput = screen.getByLabelText("Email Address");
    expect(ResetLinkButton).toBeInTheDocument();
    expect(EmailInput).toBeInTheDocument();
    const user = userEvent.setup();

    //No email provided
    await user.click(ResetLinkButton);
    await waitFor(() => {
      const FormMessage = screen.getByText("A valid email is required");
      expect(FormMessage).toBeInTheDocument();
      //expect it to be a red text
      expect(FormMessage.classList.contains("text-destructive")).toBe(true);
    });

    // Invalid email provided
    await user.type(EmailInput, "invalid-email");
    await user.click(ResetLinkButton);
    await waitFor(() => {
      const FormMessage = screen.getByText("A valid email is required");
      expect(FormMessage).toBeInTheDocument();
    });

    //The error message disappears when a valid email is provided
    await user.type(EmailInput, "test@email.com");
    await waitFor(() => {
      try {
        screen.getByText("A valid email is required");
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  it("sends reset password email when a valid email is provided after clicking the send reset link button", async () => {
    render(<ForgotPasswordPage />);

    const ResetLinkButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    const EmailInput = screen.getByLabelText("Email Address");
    expect(ResetLinkButton).toBeInTheDocument();
    expect(EmailInput).toBeInTheDocument();
    const user = userEvent.setup();

    await user.type(EmailInput, "test@email.com");
    await user.click(ResetLinkButton);
    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalled();

      //displays success message
      expect(
        screen.getByText("Password reset email sent!"),
      ).toBeInTheDocument();

      try {
        // The form disappears
        screen.getByRole("button", {
          name: "Send Reset Link",
        });
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  it("should disable submit button while sending", async () => {
    const user = userEvent.setup();
    (sendPasswordResetEmail as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
