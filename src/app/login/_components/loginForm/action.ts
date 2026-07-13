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

  switch (response.statusCode) {
    // The login endpoint rejects invalid credentials with 401 (Unauthorized),
    // 403 (Forbidden) or 422 (Unprocessable Entity) depending on the backend.
    // All of these mean the same thing to the user and must surface the same
    // message instead of throwing (which would render no error at all).
    case 401:
    case 403:
    case 422:
      return submission.reply({
        formErrors: ["The email or password is incorrect."],
      });
    default:
      throw new Error("api error");
  }
};
