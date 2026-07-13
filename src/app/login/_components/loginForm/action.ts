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
    // The login endpoint signals invalid credentials with either 401
    // (Unauthorized) or 422 (GenericError). Both must surface the same
    // user-facing message rather than the raw field errors.
    case 401:
    case 422:
      return submission.reply({
        formErrors: ["The email or password is incorrect."],
      });
    default:
      throw new Error("api error");
  }
};
