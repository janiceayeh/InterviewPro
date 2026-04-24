import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopilotPage from "@/app/(student)/(dashboard)/dashboard/copilot/page";
import { useAuth } from "@/lib/context/auth-context";

const mockSendMessage = jest.fn().mockName("mockSendMessage");
const mockSetMessages = jest.fn().mockName("mockSetMessages");

// Minimal UIMessage factory
const makeMessage = (role: "user" | "assistant", text: string) => ({
  id: Math.random().toString(36).slice(2),
  role,
  parts: [{ type: "text" as const, text }],
});

let mockMessages: ReturnType<typeof makeMessage>[] = [];
let mockStatus: "idle" | "submitted" | "streaming" = "idle";

jest.mock("@ai-sdk/react", () => ({
  useChat: jest
    .fn(() => ({
      messages: mockMessages,
      sendMessage: mockSendMessage,
      status: mockStatus,
      setMessages: mockSetMessages,
    }))
    .mockName("useChatMock"),
}));

jest.mock("ai", () => ({
  DefaultChatTransport: jest
    .fn()
    .mockImplementation(() => ({}))
    .mockName("DefaultChatTransportMock"),
}));

jest.mock("react-markdown", () => ({
  default: function MarkdownMock({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

(useAuth as jest.Mock).mockReturnValue({
  user: { uid: "test-uid" },
});

const HISTORY_CHAT = {
  id: "chat-1",
  title: "Tell me about yourself",
  messages: [makeMessage("user", "Tell me about yourself")],
  messageCount: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function mockFetch({
  historyChats = [HISTORY_CHAT],
  saveOk = true,
  deleteOk = true,
} = {}) {
  (global.fetch as jest.Mock) = jest.fn((url: string) => {
    if (url === "/api/copilot-chat/history") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { chatHistory: historyChats } }),
      });
    }
    if (url === "/api/copilot-chat/save") {
      return Promise.resolve({
        ok: saveOk,
        json: () => Promise.resolve({ data: { chat: { id: "chat-new" } } }),
      });
    }
    if (url.startsWith("/api/copilot-chat/delete")) {
      return Promise.resolve({ ok: deleteOk, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockMessages = [];
  mockStatus = "idle";
  jest.clearAllMocks();
  mockFetch();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("CopilotPage", () => {
  /**
   *  Send message flow
   *
   * Verifies that typing in the textarea and pressing Enter (or clicking Send)
   * calls sendMessage with the correct payload and clears the input afterwards.
   * This covers the core interaction loop of the component.
   */
  it.only("sends a message and clears the input on Enter", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<CopilotPage />);

    let textarea: HTMLTextAreaElement;
    await waitFor(() => {
      textarea = screen.getByPlaceholderText("Type your response...");
    });

    await user.type(textarea, "What is your greatest strength?");
    await user.keyboard("{Enter}");

    expect(mockSendMessage).toHaveBeenCalledWith({
      text: "What is your greatest strength?",
    });
    expect(textarea).toHaveValue("");
  });

  /**
   *  Chat history: load on mount & auto-save after messages change
   *
   * On mount the component fetches history and renders the chat titles in the
   * sidebar. After messages appear (simulating an assistant reply), the
   * auto-save debounce (1500 ms) fires and POSTs to /api/copilot-chat/save.
   * This covers both the load and save paths in a single integration-style test.
   */
  it("loads chat history on mount and auto-saves after new messages", async () => {
    render(<CopilotPage />);

    // History loaded and rendered in sidebar
    await waitFor(() => {
      expect(screen.getByText("Tell me about yourself")).toBeInTheDocument();
    });

    // Simulate the AI responding (messages now non-empty)
    mockMessages = [
      makeMessage("user", "Tell me about yourself"),
      makeMessage("assistant", "Sure! I am an AI interviewer."),
    ];

    // Re-render to pick up updated mockMessages (useChat is mocked statically,
    // so we trigger a state-driven re-render via act)
    act(() => {
      // Advance past the 1500 ms debounce
      jest.advanceTimersByTime(2700);
    });

    await waitFor(() => {
      const saveCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url]: [string]) => url === "/api/copilot-chat/save",
      );
      expect(saveCall).toBeDefined();
      const body = JSON.parse(saveCall[1].body);
      expect(body.title).toBe("Tell me about yourself");
    });
  });

  /**
   *  Delete chat then start a new session
   *
   * Clicking the trash icon on a history entry calls the DELETE endpoint.
   * If the deleted chat is the active one, the component resets to an empty
   * session (setMessages([]), currentChatId = null) showing the empty-state UI.
   * This covers deleteChat + startNewSession together, which is the most common
   * destructive action path.
   */
  it("deletes the active chat and resets to the empty state", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Start with the history chat already active
    mockMessages = HISTORY_CHAT.messages as ReturnType<typeof makeMessage>[];

    render(<CopilotPage />);

    // Wait for sidebar to populate
    await waitFor(() => {
      expect(screen.getByText("Tell me about yourself")).toBeInTheDocument();
    });

    // Load the chat so it becomes the active session
    await user.click(screen.getByText("Tell me about yourself"));
    expect(mockSetMessages).toHaveBeenCalledWith(HISTORY_CHAT.messages);

    // Hover reveals the delete button; click it
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      const deleteCall = (global.fetch as jest.Mock).mock.calls.find(
        ([url]: [string]) => url === "/api/copilot-chat/delete?id=chat-1",
      );
      expect(deleteCall).toBeDefined();
    });

    // After delete of active chat, setMessages([]) resets the session
    expect(mockSetMessages).toHaveBeenLastCalledWith([]);
  });
});
