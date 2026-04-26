import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InterviewSessionPage from "@/app/(student)/(dashboard)/dashboard/mock-interview/[category]/[session_id]/page";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useMockInterviewQuestions } from "@/lib/hooks";
import { toast } from "sonner";
import { getDoc, addDoc, setDoc, updateDoc } from "firebase/firestore";
import { InterviewQuestion, UserProfile } from "@/lib/types";
import { routes } from "@/lib/routes";
const Timestamp = jest.requireActual("firebase/firestore").Timestamp;

describe("InterviewSessionPage", () => {
  const mockQuestions: InterviewQuestion[] = [
    {
      id: "q1",
      question: "Tell us about your experience with React",
      category: "technical",
      difficulty: "medium",
      timeLimit: 60, // 60 seconds for faster testing
      tips: ["Mention hooks", "Talk about state management"],
      status: "published",
      roles: ["Developer"],
      createdAt: Timestamp.now(),
    },
    {
      id: "q2",
      question: "Describe a challenging project you worked on",
      category: "behavioral",
      difficulty: "medium",
      timeLimit: 60,
      tips: ["Use STAR method", "Focus on your contribution"],
      status: "published",
      roles: ["Developer"],
      createdAt: Timestamp.now(),
    },
  ];

  const mockUser = {
    uid: "user-123",
    email: "test@example.com",
  };

  const mockUserProfile: UserProfile = {
    id: "user-123",
    email: "test@example.com",
    firstname: "John",
    lastname: "Doe",
    role: "Developer",
    field: "Software Engineering",
    interviewSessionsCompleted: 0,
    totalPractiseTime: 0,
    createdAt: Timestamp.now(),
  };

  const mockRouter = {
    push: jest.fn().mockName("routerPushMock"),
  };

  const mockParams = {
    category: "technical",
    session_id: "session-123",
  };

  (useAuth as jest.Mock).mockReturnValue({
    user: mockUser,
    userProfile: mockUserProfile,
    loading: false,
  });

  (useRouter as jest.Mock).mockReturnValue(mockRouter);

  (useParams as jest.Mock).mockReturnValue(mockParams);

  (useMockInterviewQuestions as jest.Mock).mockReturnValue({
    questions: mockQuestions,
    questionsLoading: false,
  });

  (getDoc as jest.Mock).mockResolvedValue({
    exists: () => true,
    id: "session-123",
    data: () => ({
      id: "session-123",
      userId: "user-123",
      totalScore: undefined,
      totalTimeSpent: 0,
      interviewCategory: "technical",
      createdAt: Timestamp.now(),
      isCompleted: false,
      evaluation: null,
    }),
  });

  (addDoc as jest.Mock).mockResolvedValue({
    id: "answer-1",
  });

  (setDoc as jest.Mock).mockResolvedValue(undefined);
  (updateDoc as jest.Mock).mockResolvedValue(undefined);
  (toast.success as jest.Mock).mockImplementation(() => {});
  (toast.error as jest.Mock).mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Timer auto-advance to next question when timeLeft reaches 0
   *
   * Value: Verifies the critical auto-advance behavior that handles the case
   * when a user doesn't manually click "Next Question" before time runs out.
   */
  it.only("should automatically advance to next question when timer reaches 0", async () => {
    render(<InterviewSessionPage />);

    const user = userEvent.setup({ delay: null }); // Disable delay with fake timers

    // Click "Start Interview" button
    let startButton: HTMLButtonElement;
    await waitFor(() => {
      startButton = screen.getByRole("button", {
        name: /start interview/i,
      });
    });
    await user.click(startButton);

    // // Verify first question is displayed
    await waitFor(() => {
      expect(
        screen.getByText(mockQuestions.at(0).question),
      ).toBeInTheDocument();
    });

    // // Verify initial timer shows correct time
    expect(screen.getByText("1:00")).toBeInTheDocument(); // 60 seconds

    // // Fast-forward time to trigger timer countdown
    act(() => {
      jest.advanceTimersByTime(60 * 1000); // Advance 60 seconds
    });

    // // Verify second question is now displayed (auto-advance happened)
    await waitFor(() => {
      expect(
        screen.getByText(mockQuestions.at(1).question),
      ).toBeInTheDocument();
    });

    // // Verify answer was saved for the first question
    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        questionId: "q1",
        userId: "user-123",
        answer: "", // empty because user didn't type anything
        timeSpent: 60, // Full time spent
      }),
    );
  });

  /**
   *  Manual "Next Question" button saves answer and moves to next question
   *
   * Value: Verifies the core user interaction flow where users manually answer
   * and move to the next question, ensuring answers are persisted correctly.
   */
  it.only("should save answer and move to next question when Next button is clicked", async () => {
    render(<InterviewSessionPage />);
    const user = userEvent.setup({ delay: null });

    // Start interview
    let startButton: HTMLButtonElement;
    await waitFor(() => {
      startButton = screen.getByRole("button", {
        name: /start interview/i,
      });
    });
    await user.click(startButton);

    await waitFor(() => {
      expect(
        screen.getByText(mockQuestions.at(0).question),
      ).toBeInTheDocument();
    });

    // Type answer in textarea
    const textarea = screen.getByPlaceholderText(/type your answer here/i);
    const answerText =
      "I have extensive experience with React hooks and state management";
    await user.type(textarea, answerText);

    // Verify word count is displayed
    expect(screen.getByText(/10 words/)).toBeInTheDocument();

    // Advance timer by 30 seconds (half the time)
    act(() => {
      jest.advanceTimersByTime(30 * 1000);
    });

    // Click Next Question button
    const nextButton = screen.getByRole("button", { name: /next question/i });
    await user.click(nextButton);

    // Verify answer was saved with correct time spent
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          questionId: "q1",
          answer: answerText,
          userId: "user-123",
          interviewCategory: "technical",
          interviewSessionId: "session-123",
          timeSpent: 30, // 60 - 30 seconds spent
        }),
      );
    });

    await waitFor(() => {
      // Verify second question is now displayed
      expect(
        screen.getByText(mockQuestions.at(1).question),
      ).toBeInTheDocument();

      // Verify textarea is cleared for new question
      const textarea = screen.getByPlaceholderText(/type your answer here/i);
      expect(textarea).toHaveValue("");
    });
  });

  /**
   * Complete interview finish flow saves metadata and navigates to results
   *
   * Value: Verifies the end-to-end completion flow, ensuring all user data
   * (session metadata, stats) are correctly persisted before navigation.
   */
  it.only("should save interview metadata and navigate to results on completion", async () => {
    render(<InterviewSessionPage />);
    const user = userEvent.setup({ delay: null });

    // Start interview
    let startButton: HTMLButtonElement;
    await waitFor(() => {
      startButton = screen.getByRole("button", {
        name: /start interview/i,
      });
    });
    await user.click(startButton);

    await waitFor(() => {
      expect(
        screen.getByText(mockQuestions.at(0).question),
      ).toBeInTheDocument();
    });

    // Answer first question
    const textarea = screen.getByPlaceholderText(/type your answer here/i);
    await user.type(textarea, "First answer");

    act(() => {
      jest.advanceTimersByTime(20 * 1000); // 20 seconds spent
    });

    let nextButton = screen.getByRole("button", { name: /next question/i });
    await user.click(nextButton);

    // Answer second (final) question
    await waitFor(() => {
      expect(
        screen.getByText(mockQuestions.at(1).question),
      ).toBeInTheDocument();
    });

    await user.type(textarea, "Second answer");

    act(() => {
      jest.advanceTimersByTime(25 * 1000); // 25 seconds spent
    });

    // Click "Finish Interview" button (appears on last question)
    const finishButton = screen.getByRole("button", {
      name: /finish interview/i,
    });
    await user.click(finishButton);

    // Verify interview session was updated with total time
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          totalTimeSpent: 20,
          isCompleted: true,
        }),
      );
    });

    // Verify user profile metadata was updated
    expect(updateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        interviewSessionsCompleted: 1, // incremented from 0
        totalPractiseTime: 20,
      }),
    );

    // Verify last answered question was saved
    expect(setDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        questionId: "q2", // last question
        userId: "user-123",
        questionCategory: "technical",
      }),
      { merge: true },
    );

    // Verify navigation to results page
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.mockInterviewResults({
        category: mockParams.category,
        interviewSessionId: mockParams.session_id,
      }),
    );
  });
});
