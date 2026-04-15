import { z } from "zod";
import { ApiResponse, DeleteUserResponseDto } from "@/lib/types";
import { fbApp } from "@/lib/firebase-admin";
const EmailSchema = z.email();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const { error, success } = EmailSchema.safeParse(email);
    if (!success) {
      return Response.json(
        {
          error: z.treeifyError(error).errors,
          message: "Invalid email",
        },
        { status: 400 },
      );
    }

    const user = await fbApp.auth().getUserByEmail(email);
    if (!user) {
      return Response.json(
        {
          data: { ok: false },
          error: "The user does not exist",
        } satisfies ApiResponse<DeleteUserResponseDto>,
        { status: 400 },
      );
    }
    await fbApp.auth().deleteUser(user.uid);

    return Response.json({
      data: { ok: true },
      error: null,
    } satisfies ApiResponse<DeleteUserResponseDto>);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error.mesage, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
