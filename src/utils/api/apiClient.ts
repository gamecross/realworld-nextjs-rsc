import { API_BASE_URL } from "@/config/constants";
import { ApiPath, ApiResponse, HttpErrorCode, HttpMethodOfPath, RequestParams } from "./apiTypes";

const buildPathString = ({
  pathTemplate,
  params,
}: {
  pathTemplate: string;
  params: {
    path?: Record<PropertyKey, string | number>;
    query?: Record<PropertyKey, string | number>;
  };
}) => {
  // replace path param placeholders to actual values
  const path = Object.entries(params?.path ?? {}).reduce(
    (prev, [key, value]) => prev.replace(new RegExp(`\\{${key}\\}`), String(value)),
    pathTemplate,
  );

  const searchParam = Object.entries(params.query ?? {})
    .reduce((prev, [key, value]) => {
      prev.set(key, String(value));
      return prev;
    }, new URLSearchParams())
    .toString();

  return searchParam.length > 0 ? path + "?" + searchParam : path;
};

export const isExpectedErrorCode = (statusCode: number): statusCode is HttpErrorCode => {
  return statusCode >= 0;
};

export const createApiClient = <P extends ApiPath, M extends HttpMethodOfPath<P>>({
  path,
  method,
  params,
  tags,
  cache,
  revalidate,
}: {
  path: P;
  method: M;
  params: RequestParams<P, M>;
  token?: string;
  tags?: string[];
  cache?: RequestCache;
  revalidate?: number | false;
}) => {
  const fullPath = buildPathString({
    pathTemplate: path,
    params,
  });

  const sendRequest = async (): Promise<ApiResponse<P, M>> => {
    const { getSession } = await import("@/utils/auth/session");
    const token = await getSession();

    // Read the base URL at request time (not at module-load time) so that the
    // value is resolved from the current environment. Reading it lazily avoids
    // capturing `undefined` when the env var is populated after module import.
    const baseUrl = process.env.API_BASE_URL ?? API_BASE_URL;

    const response = await fetch(baseUrl + fullPath, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token && { Authorization: `Token ${token}` }),
      },
      ...(params.body && { body: JSON.stringify(params.body) }),
      cache,
      next: { tags, revalidate },
    });

    if (response.ok) {
      return {
        result: "success",
        data: await response.json(),
      };
    }

    if (isExpectedErrorCode(response.status)) {
      return {
        result: "error",
        statusCode: response.status,
        error: await response.json(),
      };
    }

    throw new Error("Unexpected error.");
  };

  return { path: fullPath, sendRequest };
};
