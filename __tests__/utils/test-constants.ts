import { User } from "firebase/auth";
import { UserProfile } from "@/lib/types";

/**
 * Mock auth user for testing
 */
export const mockAuthUser = {
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: "test-refresh-token",
  tenantId: null,
} satisfies Partial<User>;

export const mockUserProfile: Partial<UserProfile> = {
  id: mockAuthUser.uid,
  email: mockAuthUser.email,
  about: "",
  field: "Computer Science",
  role: "Software Engineer",
  firstname: "John",
  lastname: "Doe",
  interviewSessionsCompleted: 0,
  totalPractiseTime: 0,
};

/**
 * Mock auth context value
 */
export const mockAuthContextValue = {
  user: mockAuthUser,
  loading: false,
  error: null,
  signUp: jest.fn(),
  signIn: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
};

/**
 * Mock Firestore document
 */
export const mockFirestoreDoc = {
  id: "test-doc-123",
  data: jest.fn(() => ({
    userId: "test-user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  exists: true,
  ref: {},
  metadata: {},
};

/**
 * Mock Firestore snapshot
 */
export const mockFirestoreSnapshot = {
  docs: [mockFirestoreDoc],
  empty: false,
  size: 1,
  forEach: jest.fn((callback) => {
    callback(mockFirestoreDoc);
  }),
};
