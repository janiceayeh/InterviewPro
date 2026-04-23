import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForumPost, ForumPostAnswer } from "@/lib/types";
import ForumPostAnswerCard from "@/components/forum/ForumPostAnswerCard";
import { useFlagPost, useUserProfile } from "@/lib/hooks";
import { toast } from "sonner";
import {
  deleteDoc,
  getCountFromServer,
  getDocs,
  updateDoc,
} from "firebase/firestore";

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
    createdAt: jest.requireActual("firebase/firestore").Timestamp.now(),
    updatedAt: jest.requireActual("firebase/firestore").Timestamp.now(),
    isAccepted: false,
    isEdited: false,
    votes: 5,
  } as ForumPostAnswer;

  const mockPost: ForumPost = {
    id: "post-1",
    authorId: "author-1",
    title: "Test Post",
    content: "Test content",
    createdAt: jest.requireActual("firebase/firestore").Timestamp.now(),
    updatedAt: jest.requireActual("firebase/firestore").Timestamp.now(),
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

  it.only("should render answer card with author information and content", async () => {
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

  it.only("should show accept answer button only for post author and accept the answer", async () => {
    const updateDocMock = jest
      .fn()
      .mockResolvedValue(undefined)
      .mockName("updateDocMock");
    const getDocsMock = jest
      .fn()
      .mockResolvedValue({ empty: true })
      .mockName("getDocsMock");

    (updateDoc as jest.Mock) = updateDocMock;
    (getDocs as jest.Mock) = getDocsMock;

    render(<ForumPostAnswerCard {...defaultProps} />);
    const user = userEvent.setup();

    const acceptButton = screen.getByRole("button", { name: /accept answer/i });
    expect(acceptButton).toBeInTheDocument();

    await act(async () => await user.click(acceptButton));

    await waitFor(() => {
      expect(getDocsMock).toHaveBeenCalled();
      expect(updateDocMock).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Answer accepted");
      expect(defaultProps.onAcceptAnswer).toHaveBeenCalled();
    });
  });

  it("should delete answer when user confirms deletion", async () => {
    const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
    const refetchAnswers = jest.fn();

    (deleteDoc as jest.Mock) = mockDeleteDoc;

    const answerAuthorProps = {
      ...defaultProps,
      userId: "author-1", // Make current user the answer author
      refetchAnswers,
    };

    render(<ForumPostAnswerCard {...answerAuthorProps} />);

    const user = userEvent.setup();

    // Click delete button
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion in alert dialog
    const confirmDeleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining("forumPostAnswers/answer-1"),
        }),
      );
      expect(refetchAnswers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Answer deleted successfully");
    });
  });

  it("should show edit form when answer author clicks edit", async () => {
    const answerAuthorProps = {
      ...defaultProps,
      userId: "author-1", // Make current user the answer author
    };

    const { rerender } = render(<ForumPostAnswerCard {...answerAuthorProps} />);

    const user = userEvent.setup();

    // Click edit button
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    // Verify ForumPostAnswerForm is shown
    await waitFor(() => {
      expect(screen.getByTestId("answer-form")).toBeInTheDocument();
    });

    // Click cancel on the form
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Rerender to verify editing state is reset
    rerender(<ForumPostAnswerCard {...answerAuthorProps} />);
    expect(screen.queryByTestId("answer-form")).not.toBeInTheDocument();
    expect(screen.getByText(mockAnswer.content)).toBeInTheDocument();
  });
});
