import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { verifyLoggedInUser } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/constants";
import {
  ApiResponse,
  SaveCopilotChatResponseDto,
  SaveCopilotChatRequestDto,
} from "@/lib/types";

export async function POST(req: Request) {
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
            chat: null,
          },
        } satisfies ApiResponse<SaveCopilotChatResponseDto>,
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
            chat: null,
          },
        } satisfies ApiResponse<SaveCopilotChatResponseDto>,
        {
          status: 401,
        },
      );
    }

    const body: SaveCopilotChatRequestDto = await req.json();
    const { chatId, title, messages } = body;

    if (!title || !messages) {
      return Response.json(
        {
          error: "Title and messages are required",
          data: { chat: null },
        } satisfies ApiResponse<SaveCopilotChatResponseDto>,
        { status: 400 },
      );
    }

    const chatsRef = collection(db, COLLECTIONS.copilotChats);
    const chatData = {
      userId: userId,
      title,
      messages,
      messageCount: messages.length,
      updatedAt: Timestamp.now(),
    };

    let resultId: string;

    if (chatId) {
      // Update existing chat
      const chatDocRef = doc(db, COLLECTIONS.copilotChats, chatId);
      await updateDoc(chatDocRef, chatData);
      resultId = chatId;
    } else {
      // Create new chat
      const chatDocRef = await addDoc(chatsRef, {
        ...chatData,
        createdAt: Timestamp.now(),
      });
      resultId = chatDocRef.id;
    }

    return Response.json({
      error: null,
      data: {
        chat: {
          id: resultId,
          ...chatData,
        },
      },
    } satisfies ApiResponse<SaveCopilotChatResponseDto>);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "Failed to save chat",
        data: { chat: null },
      } satisfies ApiResponse<SaveCopilotChatResponseDto>,
      { status: 500 },
    );
  }
}
