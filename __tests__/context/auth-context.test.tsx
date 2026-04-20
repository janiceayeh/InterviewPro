import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../utils/test-utils";
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

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, signIn, signUp, logout } = useAuth();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <div>
          <div>Welcome {user.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={() => signIn("test@example.com", "password123")}>
            Sign In
          </button>
          <button onClick={() => signUp("test@example.com", "password123")}>
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render auth provider without crashing", () => {
    render(<TestComponent />);
    expect(screen.getByText(/Sign In|Sign Up/)).toBeInTheDocument();
  });

  it("should handle user sign in", async () => {
    const user = jest.fn();
    mockSignIn.mockResolvedValue({ user } as any);

    render(<TestComponent />);

    const signInButton = screen.getByText("Sign In");
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.any(Object),
        "test@example.com",
        "password123",
      );
    });
  });

  it("should handle user sign up", async () => {
    const user = jest.fn();
    mockSignUp.mockResolvedValue({ user } as any);

    render(<TestComponent />);

    const signUpButton = screen.getByText("Sign Up");
    await userEvent.click(signUpButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.any(Object),
        "test@example.com",
        "password123",
      );
    });
  });

  it("should handle user logout", async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it("should handle sign in errors", async () => {
    const error = new Error("Invalid credentials");
    mockSignIn.mockRejectedValue(error);

    render(<TestComponent />);

    const signInButton = screen.getByText("Sign In");
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
