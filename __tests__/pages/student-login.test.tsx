import React from "react";
import StudentLoginPage from "@/app/(student)/(auth)/login/page";
import { render } from "../utils/test-utils";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { mockAuthUser } from "../utils/test-constants";
import { signInWithEmailAndPassword } from "firebase/auth";

describe("Student Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the student login form", async () => {
    render(<StudentLoginPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();

    const ForgotPasswordLink = screen.getByRole("link", {
      name: "Forgot password?",
    });
    expect(ForgotPasswordLink).toBeInTheDocument();

    expect((ForgotPasswordLink as HTMLAnchorElement).pathname).toBe(
      routes.userForgotPassword(),
    );

    expect(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Google",
      }),
    ).toBeInTheDocument();

    const SignupLink = screen.getByRole("link", {
      name: "Sign up",
    });
    expect(SignupLink).toBeInTheDocument();

    expect((SignupLink as HTMLAnchorElement).pathname).toBe(
      routes.userSignup(),
    );
  });

  it("should not login the student when email and password are not provided before clicking sign in button", async () => {
    render(<StudentLoginPage />);

    const user = userEvent.setup();

    const SigninButton = screen.getByRole("button", {
      name: "Sign in",
    });
    expect(SigninButton).toBeInTheDocument();

    await user.click(SigninButton);
    await waitFor(() => {
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  it("should login student when email and password are provided before clicking sign in button ", async () => {
    let resolveSignIn: () => void;
    const signInMock = jest.fn(
      () => new Promise<void>((res) => (resolveSignIn = res)),
    );

    // Configure the mock for this specific test
    (useAuth as jest.Mock).mockReturnValue({
      signIn: signInMock,
    });

    const routerPushMock = jest.fn((_path) => undefined);
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    render(<StudentLoginPage />);
    const user = userEvent.setup();

    const EmailInput = screen.getByPlaceholderText("Enter your email");
    const PasswordInput = screen.getByPlaceholderText("Enter your password");
    const SigninButton = screen.getByRole("button", {
      name: "Sign in",
    });

    expect(EmailInput).toBeInTheDocument();
    expect(PasswordInput).toBeInTheDocument();
    expect(SigninButton).toBeInTheDocument();

    const email = "test@example.com";
    const password = "v3RySEcur3Pazzword";
    await user.type(EmailInput, email);
    await user.type(PasswordInput, password);
    await user.click(SigninButton);

    await waitFor(() => expect(SigninButton).toBeDisabled());

    resolveSignIn!();

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(email, password);
      expect(routerPushMock).toHaveBeenCalledWith(routes.dashboard());
    });
  });

  it("should call signInWithGoogle when Google button is clicked", async () => {
    let resolveSignInWithGoogle: (_userCredential) => void;
    const signInWithGoogleMock = jest
      .fn(() => new Promise((res) => (resolveSignInWithGoogle = res)))
      .mockName("signInWithGoogleMock");

    // Configure the mock for this specific test
    (useAuth as jest.Mock).mockReturnValue({
      signInWithGoogle: signInWithGoogleMock,
    });

    const routerPushMock = jest
      .fn((_path) => undefined)
      .mockName("routerPushMock");
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    render(<StudentLoginPage />);
    const user = userEvent.setup();

    const GoogleButton = screen.getByRole("button", {
      name: "Google",
    });
    expect(GoogleButton).toBeInTheDocument();

    await user.click(GoogleButton);

    await waitFor(() => expect(GoogleButton).toBeDisabled());

    resolveSignInWithGoogle!({ user: mockAuthUser });

    await waitFor(() => {
      expect(signInWithGoogleMock).toHaveBeenCalled();
      expect(routerPushMock).toHaveBeenCalledWith(routes.dashboard());
    });
  });
});
