import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForumPost, ForumPostAnswer } from "@/lib/types";
import ForumPostAnswerCard from "@/components/forum/ForumPostAnswerCard";
import { useFlagPost, useUserProfile } from "@/lib/hooks";
import { toast } from "sonner";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
const Timestamp = jest.requireActual("firebase/firestore").Timestamp;

describe("ForumPostAnswerCard", () => {
  const mockAuthor = {
    id: "author-1",
    firstname: "John",
    lastname: "Doe",
    role: "Expert",
  };

  const mockAnswer: ForumPostAnswer = {
    id: "answer-1",
    postId: "post-1",
    authorId: "author-1",
    content: "This is a great answer",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isAccepted: false,
    isEdited: false,
    votes: 5,
  } as ForumPostAnswer;

  const mockPost: ForumPost = {
    id: "post-1",
    authorId: "author-1",
    title: "Test Post",
    content: "Test content",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    hasAcceptedAnswer: false,
  } as ForumPost;

  const defaultProps = {
    answer: mockAnswer,
    post: mockPost,
    userId: "author-1",
    onAcceptAnswer: jest.fn().mockName("onAcceptAnswerMock"),
    refetchAnswers: jest.fn().mockName("refetchAnswersMock"),
  };

  (useUserProfile as jest.Mock).mockReturnValue({
    userProfile: mockAuthor,
    userProfileLoading: false,
  });

  (useFlagPost as jest.Mock).mockReturnValue({
    isFlaggingPost: false,
    flagPost: jest.fn().mockName("flagPostMock"),
  });

  (getCountFromServer as jest.Mock).mockResolvedValue({
    data: jest
      .fn(() => ({
        count: 0,
      }))
      .mockName("getCountFromServerDataMock"),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render answer card with author information and content", async () => {
    render(<ForumPostAnswerCard {...defaultProps} />);

    // Verify author info is displayed
    expect(screen.getByText(mockAuthor.firstname)).toBeInTheDocument();
    expect(screen.getByText(mockAuthor.role)).toBeInTheDocument();

    // Verify answer content is displayed
    expect(screen.getByText(mockAnswer.content)).toBeInTheDocument();

    // Verify action buttons exist
    expect(
      screen.getByRole("button", { name: /accept answer/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument();

    // Verify vote button and vote component are rendered
    expect(
      screen.getByTestId("forum-post-answer-vote-button"),
    ).toBeInTheDocument();
  });

  it("should show accept answer button only for post author and accept the answer", async () => {
    (collection as jest.Mock).mockReturnValue("mockCollection");
    (where as jest.Mock).mockReturnValue("mockWhere");
    (limit as jest.Mock).mockReturnValue("mockLimit");
    (query as jest.Mock).mockReturnValue("mockQuery");
    (doc as jest.Mock).mockReturnValue({ path: "mock-path" });
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ id: "mock-id" }],
    });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (serverTimestamp as jest.Mock).mockReturnValue(undefined);

    render(<ForumPostAnswerCard {...defaultProps} />);
    const user = userEvent.setup();

    const acceptButton = screen.getByRole("button", { name: /accept answer/i });
    expect(acceptButton).toBeInTheDocument();

    await user.click(acceptButton);

    await waitFor(() => {
      expect(getDocs).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledTimes(3);
      expect(toast.success).toHaveBeenCalledWith("Answer accepted");
      expect(defaultProps.onAcceptAnswer).toHaveBeenCalled();
    });
  });

  it("should delete answer when user confirms deletion", async () => {
    (deleteDoc as jest.Mock).mockReturnValue(undefined);

    render(<ForumPostAnswerCard {...defaultProps} />);
    const user = userEvent.setup();

    // Click delete button
    const deleteButton = screen.getByTestId("delete-btn");
    await user.click(deleteButton);

    // Confirm deletion in alert dialog
    const confirmDeleteButton = screen.getByTestId("confirm-delete-btn");
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      expect(defaultProps.refetchAnswers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Answer deleted successfully");
    });
  });

  it("should show edit form when answer author clicks edit", async () => {
    const { rerender } = render(<ForumPostAnswerCard {...defaultProps} />);
    const user = userEvent.setup();

    // Click edit button
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    // Verify ForumPostAnswerForm is shown
    await waitFor(() => {
      expect(screen.getByTestId("forum-post-answer-form")).toBeInTheDocument();
    });

    // Click cancel on the form
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Rerender to verify editing state is reset
    rerender(<ForumPostAnswerCard {...defaultProps} />);
    expect(
      screen.queryByTestId("forum-post-answer-form"),
    ).not.toBeInTheDocument();
    expect(screen.getByText(mockAnswer.content)).toBeInTheDocument();
  });
});
