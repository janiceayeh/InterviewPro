import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../utils/test-utils";
import StudentProfilePage from "@/app/(student)/(dashboard)/dashboard/profile/page";
import { useAuth } from "@/lib/context/auth-context";
import { UserProfile } from "@/lib/types";

jest.mock("../src/lib/context/auth-context");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("Student Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        uid: "test-user",
        email: "test@example.com",
        displayName: "John Doe",
      } as any,
      userProfile: {
        id: "test-user",
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        role: "Software Engineer",
        totalPractiseTime: 0,
        interviewSessionsCompleted: 0,
        field: "Computer Science",
        about: "",
        createdAt: undefined,
        updatedAt: undefined,
      } satisfies Partial<UserProfile>,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      deleteAccount: jest.fn(),
      getUserProfile: jest.fn(),
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fullName: "Test User",
        email: "test@example.com",
        bio: "Test bio",
        targetRole: "Software Engineer",
        targetCompanies: ["Google", "Meta"],
      }),
    });
  });

  it("should render profile page with form fields", async () => {
    render(<StudentProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    });
  });

  it("should load user profile data on mount", async () => {
    render(<StudentProfilePage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/user/profile");
    });
  });

  it("should display loaded profile information", async () => {
    render(<StudentProfilePage />);

    await waitFor(() => {
      const fullNameInput = screen.getByDisplayValue(/Test User/i);
      expect(fullNameInput).toBeInTheDocument();
    });
  });

  it("should allow user to update profile", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fullName: "Test User",
          email: "test@example.com",
          bio: "Test bio",
          targetRole: "Software Engineer",
          targetCompanies: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<StudentProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/user/profile",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });

  it("should validate required fields before submission", async () => {
    const user = userEvent.setup();
    render(<StudentProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    const fullNameInput = screen.getByLabelText(
      /full name/i,
    ) as HTMLInputElement;
    await user.clear(fullNameInput);

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });

  it("should handle profile update errors", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fullName: "Test User",
          email: "test@example.com",
          bio: "",
          targetRole: "",
          targetCompanies: [],
        }),
      })
      .mockRejectedValueOnce(new Error("Update failed"));

    render(<StudentProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error updating profile/i)).toBeInTheDocument();
    });
  });

  it("should display success message after profile update", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fullName: "Test User",
          email: "test@example.com",
          bio: "Updated bio",
          targetRole: "Software Engineer",
          targetCompanies: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<StudentProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/profile updated successfully/i),
      ).toBeInTheDocument();
    });
  });
});
