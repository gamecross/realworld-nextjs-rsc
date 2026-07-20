import { createApiClient } from "@/utils/api/apiClient";
import { Profile } from "@/utils/types/models";

export const fetchProfile = async (username: string) => {
  const client = createApiClient({
    path: "/profiles/{username}",
    method: "get",
    params: {
      path: {
        username,
      },
    },
  });

  const response = await client.sendRequest();

  if (response.result === "success") {
    return Profile.parse(response.data.profile);
  }

  throw new Error("api error");
};
