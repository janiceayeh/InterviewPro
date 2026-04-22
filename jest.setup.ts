import "@testing-library/jest-dom";
import { mockAuthUser } from "./__tests__/utils/test-constants";

global.fetch = jest.fn();
(global.Response as any) = jest.fn().mockImplementation((body, init) => ({
  ok: true,
  status: 200,
  statusText: "OK",
  headers: new Map(),
  body: body,
  text: jest.fn().mockResolvedValue(body),
  json: jest.fn().mockResolvedValue(JSON.parse(body)),
}));

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

jest.mock("./src/lib/context/auth-context", () => ({
  useAuth: jest.fn(() => ({
    signIn: jest.fn(),
    signInWithGoogle: jest.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("./src/lib/hooks", () => ({
  useStudentPersonalisedAnalytics: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
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
