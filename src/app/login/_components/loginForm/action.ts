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

  // Invalid credentials can surface under different HTTP statuses depending on
  // the backend (401 Unauthorized, 403 Forbidden, or 422 Unprocessable Entity).
  // For the login endpoint any error result means the sign-in attempt failed, so
  // always surface the same friendly, form-level message the UI expects.
  return submission.reply({
    formErrors: ["The email or password is incorrect."],
  });
};
