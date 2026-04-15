import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { verifyLoggedInUser } from "@/lib/firebase-admin";
import { ApiResponse, GetCopilotChatHistoryResponseDto } from "@/lib/types";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export async function GET(req: Request) {
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
            chatHistory: null,
          },
        } satisfies ApiResponse<GetCopilotChatHistoryResponseDto>,
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
            chatHistory: null,
          },
        } satisfies ApiResponse<GetCopilotChatHistoryResponseDto>,
        {
          status: 401,
        },
      );
    }
    const chatsRef = collection(db, COLLECTIONS.copilotChats);
    const q = query(
      chatsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toString?.(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toString?.(),
    }));

    return Response.json({
      data: {
        chatHistory: chats as any,
      },
      error: null,
    } satisfies ApiResponse<GetCopilotChatHistoryResponseDto>);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "Failed to fetch chat history",
        data: { chatHistory: null },
      } satisfies ApiResponse<GetCopilotChatHistoryResponseDto>,
      { status: 500 },
    );
  }
}
