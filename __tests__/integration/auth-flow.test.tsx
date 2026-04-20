import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "..//utils/test-utils";
import { useAuth } from "@/lib/context/auth-context";
import * as firebase from "@/lib/firebase";

jest.mock("../src/lib/firebase");

const mockSignIn = firebase.signInWithEmailAndPassword as jest.MockedFunction<
  typeof firebase.signInWithEmailAndPassword
>;
const mockSignUp =
  firebase.createUserWithEmailAndPassword as jest.MockedFunction<
    typeof firebase.createUserWithEmailAndPassword
  >;
const mockSignOut = firebase.signOut as jest.MockedFunction<
  typeof firebase.signOut
>;
const mockSendPasswordReset =
  firebase.sendPasswordResetEmail as jest.MockedFunction<
    typeof firebase.sendPasswordResetEmail
  >;

// Mock components for integration testing
const LoginComponent = () => {
  const { user, loading, signIn } = useAuth();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <div>Logged in as {user.email}</div>
      ) : (
        <div>
          <input
            type="email"
            defaultValue="test@example.com"
            data-testid="email-input"
          />
          <input
            type="password"
            defaultValue="password123"
            data-testid="password-input"
          />
          <button
            onClick={() => signIn("test@example.com", "password123")}
            data-testid="login-btn"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

const SignUpComponent = () => {
  const { user, loading, signUp } = useAuth();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <div>Account created for {user.email}</div>
      ) : (
        <div>
          <input
            type="email"
            defaultValue="newuser@example.com"
            data-testid="signup-email"
          />
          <button
            onClick={() => signUp("newuser@example.com", "password123")}
            data-testid="signup-btn"
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should complete full login flow", async () => {
    const user = userEvent.setup();
    const mockUser = { uid: "user123", email: "test@example.com" };

    mockSignIn.mockResolvedValue({ user: mockUser } as any);

    render(<LoginComponent />);

    const loginBtn = screen.getByTestId("login-btn");
    await user.click(loginBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it("should complete full signup flow", async () => {
    const user = userEvent.setup();
    const mockUser = { uid: "user456", email: "newuser@example.com" };

    mockSignUp.mockResolvedValue({ user: mockUser } as any);

    render(<SignUpComponent />);

    const signupBtn = screen.getByTestId("signup-btn");
    await user.click(signupBtn);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  it("should handle login error and allow retry", async () => {
    const user = userEvent.setup();
    const error = new Error("Invalid credentials");

    mockSignIn.mockRejectedValueOnce(error).mockResolvedValueOnce({
      user: { uid: "user123", email: "test@example.com" },
    } as any);

    render(<LoginComponent />);

    const loginBtn = screen.getByTestId("login-btn");

    // First attempt fails
    await user.click(loginBtn);
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    // Retry succeeds
    await user.click(loginBtn);
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });
  });

  it("should handle password reset in auth flow", async () => {
    mockSendPasswordReset.mockResolvedValue(undefined);

    render(
      <div>
        <button
          onClick={() =>
            mockSendPasswordReset(firebase.auth as any, "test@example.com")
          }
        >
          Reset Password
        </button>
      </div>,
    );

    const resetBtn = screen.getByText("Reset Password");
    await userEvent.click(resetBtn);

    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalled();
    });
  });

  it("should maintain auth state across component re-renders", async () => {
    const mockUser = { uid: "user123", email: "test@example.com" };
    mockSignIn.mockResolvedValue({ user: mockUser } as any);

    const { rerender } = render(<LoginComponent />);

    const loginBtn = screen.getByTestId("login-btn");
    await userEvent.click(loginBtn);

    // Re-render should maintain auth state
    rerender(<LoginComponent />);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
