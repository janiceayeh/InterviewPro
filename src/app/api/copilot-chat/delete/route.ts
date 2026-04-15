import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { verifyLoggedInUser } from "@/lib/firebase-admin";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { ApiResponse, DeleteCopilotChatResponseDto } from "@/lib/types";

export async function DELETE(req: Request) {
  try {
    const { headers } = req;
    const userId = headers.get("uid");
    const idToken = headers.get("authorization");
    const { error, ok, isLoggedIn } = await verifyLoggedInUser({
      userId,
      idToken,
    });
    if (error) {
      return Response.json(
        {
          error: error.message,
          data: {
            success: false,
          },
        } satisfies ApiResponse<DeleteCopilotChatResponseDto>,
        {
          status: 401,
        },
      );
    }

    if (ok && !isLoggedIn) {
      return Response.json(
        {
          error: "Unauthorized",
          data: {
            success: false,
          },
        } satisfies ApiResponse<DeleteCopilotChatResponseDto>,
        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("id");

    if (!chatId) {
      return Response.json(
        {
          error: "Chat ID is required",
          data: { success: false },
        } satisfies ApiResponse<DeleteCopilotChatResponseDto>,
        { status: 400 },
      );
    }

    // Verify ownership before deleting
    const chatDocRef = doc(db, COLLECTIONS.copilotChats, chatId);
    const chatDoc = await getDoc(chatDocRef);

    if (!chatDoc.exists()) {
      return Response.json(
        {
          error: "Chat not found",
          data: { success: false },
        } satisfies ApiResponse<DeleteCopilotChatResponseDto>,
        { status: 404 },
      );
    }

    if (chatDoc.data().userId !== userId) {
      return Response.json(
        {
          error: "Forbidden",
          data: {
            success: false,
          },
        } satisfies ApiResponse<DeleteCopilotChatResponseDto>,
        { status: 403 },
      );
    }

    await deleteDoc(chatDocRef);

    return Response.json({
      data: { success: true },
      error: null,
    } satisfies ApiResponse<DeleteCopilotChatResponseDto>);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "Failed to delete chat",
        data: { success: false },
      } satisfies ApiResponse<DeleteCopilotChatResponseDto>,
      { status: 500 },
    );
  }
}
