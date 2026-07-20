"use server";

import { createApiClient } from "@/utils/api/apiClient";
import { createSession } from "@/utils/auth/session";
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { inputsSchema } from "./types";

export const signUpAction = async (_prevState: unknown, formData: FormData) => {
  const submission = parseWithZod(formData, {
    schema: inputsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createApiClient({
    path: "/users",
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
    // Invalidate the cached root layout so the shared <Header> re-renders with
    // the new authenticated session instead of serving the stale (logged-out)
    // layout from the Router Cache after the redirect below.
    revalidatePath("/", "layout");
    redirect("/");
  }

  switch (response.statusCode) {
    case 422:
      return submission.reply({
        formErrors: Object.values(response.error.errors).flat(),
      });
    default:
      throw new Error("api error");
  }
};
