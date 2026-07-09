"use server";

import { createApiClient } from "@/utils/api/apiClient";
import { createSession } from "@/utils/auth/session";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { inputsSchema } from "./types";

export const signInAction = async (_prevState: unknown, formData: FormData) => {
  const submission = parseWithZod(formData, {
    schema: inputsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createApiClient({
    path: "/users/login",
    method: "post",
    params: {
      body: {
        user: submission.value,
      },
    },
  });

  const response = await client.sendRequest();

  if (response.result === "success") {
    await createSession(response.data.user.token);
    redirect("/");
  }

  // The request body already passed Zod validation above, so any non-success
  // response here means the API rejected the credentials. The RealWorld backend
  // signals a failed login with 422 { errors: { "email or password": "is invalid" } }
  // (and some deployments use 401/403). Previously the 422 branch surfaced the raw
  // backend string ("is invalid") and any other code hit `default` and threw, so the
  // friendly "The email or password is incorrect." message was never shown. We now
  // normalize every credential-rejection response to that single, user-facing message.
  return submission.reply({
    formErrors: ["The email or password is incorrect."],
  });
};
