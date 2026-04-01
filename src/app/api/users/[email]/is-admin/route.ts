import { AdminRole } from "@/lib/types";
import { z } from "zod";

let adminUsers: Record<string, AdminRole> = {};

const adminUsersEnv = process.env.ADMIN_USERS;
if (adminUsersEnv) {
  if (!adminUsersEnv) throw new Error("ADMIN_USERS env is required");
  adminUsers = JSON.parse(adminUsersEnv);
}

const EmailSchema = z.email();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    const { email } = await params;
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

    const adminRole = adminUsers[email];
    if (!adminRole) {
      return Response.json(
        {
          error: new Error("Not an admin user"),
          message: "You do not have admin access",
        },
        { status: 403 },
      );
    }

    return Response.json({
      isAdmin: true,
      role: adminRole,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
