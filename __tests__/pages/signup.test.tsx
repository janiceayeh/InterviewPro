import { render } from "../utils/test-utils";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { routes } from "@/lib/routes";
import SignupPage from "@/app/(student)/(auth)/signup/page";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { updateProfile, UserCredential } from "firebase/auth";
import { setDoc } from "firebase/firestore";

const passwordRequirements = [
  "At least 8 characters",
  "Contains a number",
  "Contains uppercase letter",
];

describe("Signup Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render sign up form", async () => {
    render(<SignupPage />);

    expect(screen.getByPlaceholderText("Enter firstname")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter lastname")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Create a password"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm your password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google" })).toBeInTheDocument();
  });

  it("should render a link to the sign in page", async () => {
    render(<SignupPage />);

    const SigninLink = screen.getByRole("link", { name: "Sign in" });
    expect(SigninLink).toBeInTheDocument();
    expect((SigninLink as HTMLAnchorElement).pathname).toBe(routes.userLogin());
  });

  it("should disable the sign up button before all form requirements are met", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();

    const SignupButton = screen.getByRole("button", { name: "Create account" });
    const FirstnameInput = screen.getByPlaceholderText("Enter firstname");
    const LastnameInput = screen.getByPlaceholderText("Enter lastname");

    await user.type(FirstnameInput, "John");
    await user.type(LastnameInput, "Doe");

    expect(SignupButton).toBeDisabled();
  });

  it("should display a 'passwords do not match' error when passwords don't match", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();

    const PasswordInput = screen.getByPlaceholderText("Create a password");
    const ConfirmPasswordInput = screen.getByPlaceholderText(
      "Confirm your password",
    );
    expect(PasswordInput).toBeInTheDocument();
    expect(ConfirmPasswordInput).toBeInTheDocument();

    await user.type(PasswordInput, "MyPasswordIsSecure");
    await user.type(ConfirmPasswordInput, "Not_thesame_password");

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("should display all password requirements when typing in the password input", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();
    const PasswordInput = screen.getByPlaceholderText("Create a password");
    expect(PasswordInput).toBeInTheDocument();
    await user.type(PasswordInput, "My..");
    for (const requirementText of passwordRequirements) {
      expect(screen.getByText(requirementText)).toBeInTheDocument();
    }
  });

  it("should highlight all password requirements when met", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();
    const PasswordInput = screen.getByPlaceholderText("Create a password");
    expect(PasswordInput).toBeInTheDocument();
    await user.type(PasswordInput, "MySup3RS3kURePaxxzzzxz");
    for (const requirementText of passwordRequirements) {
      expect(
        screen.getByText(requirementText).classList.contains("text-success"),
      ).toBe(true);
    }
  });

  it("should register user when all form requirements are met", async () => {
    (updateProfile as jest.Mock).mockResolvedValue(undefined);

    let resolveSignUp: () => void;
    const singUpMock = jest
      .fn(
        () =>
          new Promise((resolve) => {
            resolveSignUp = () => {
              resolve({
                user: {
                  uid: "test-uid",
                } as any,
              } as UserCredential);
            };
          }),
      )
      .mockName("singUpMock");

    (useAuth as jest.Mock).mockReturnValue({
      signUp: singUpMock,
    });

    const routerPushMock = jest.fn((_path) => undefined);
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    render(<SignupPage />);
    const user = userEvent.setup();
    const FirstnameInput = screen.getByPlaceholderText("Enter firstname");
    const LastnameInput = screen.getByPlaceholderText("Enter lastname");
    const EmailInput = screen.getByPlaceholderText("Enter email");
    const PasswordInput = screen.getByPlaceholderText("Create a password");
    const ConfirmPasswordInput = screen.getByPlaceholderText(
      "Confirm your password",
    );
    const SignupButton = screen.getByRole("button", { name: "Create account" });

    const password = "MySup3RS3kURePaxxzzzxz";
    const email = "john@wick.com";

    await user.type(FirstnameInput, "Jonathan");
    await user.type(LastnameInput, "Wick");
    await user.type(EmailInput, email);
    await user.type(PasswordInput, password);
    await user.type(ConfirmPasswordInput, password);

    await waitFor(() => {
      expect(SignupButton).not.toBeDisabled();
    });

    await user.click(SignupButton);

    await waitFor(() => {
      expect(SignupButton).toBeDisabled();
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });

    resolveSignUp!();

    await waitFor(() => {
      expect(singUpMock).toHaveBeenCalledWith(email, password);
      expect(updateProfile).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
      expect(routerPushMock).toHaveBeenCalledWith(
        routes.studentRoleOnboarding(),
      );
    });
  });
});
