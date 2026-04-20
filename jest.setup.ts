import "@testing-library/jest-dom";
import {
  mockAuthUser,
  mockUserProfile,
} from "./__tests__/utils/test-constants";

// Mock Firebase
jest.mock("./src/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((authOrCallback, callback) => {
    const cb = callback || authOrCallback;
    if (typeof cb === "function") {
      cb(mockAuthUser);
    }
    return jest.fn(); // Unsubscribe function
  }),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getDoc: jest.fn().mockResolvedValue({
    id: mockUserProfile.id,
    data: () => mockUserProfile,
  }),
  doc: jest.fn((_db, collection, docId) => ({
    _key: { path: { segments: [collection, docId] } },
  })),
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Not implemented: HTMLFormElement.prototype.submit"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
