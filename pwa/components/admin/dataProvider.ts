"use client";

import { fetchHydra, hydraDataProvider } from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { getAccessToken } from "./getAccessToken";

const apiDocumentationParser = (accessToken: string | null) => async () => {
  try {
    return await parseHydraDocumentation(
      /* @ts-ignore */
      process.env.NEXT_PUBLIC_API_ENTRYPOINT,
      {
        headers: {
          // @ts-ignore
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (result) {
    // @ts-ignore
    const { api, response, status } = result;
    if (status !== 401 || !response) {
      throw result;
    }
    console.log(api);
    return {
      api,
      response,
      status,
    };
  }
};

export const dataProvider = hydraDataProvider({
  /* @ts-ignore */
  entrypoint: process.env.NEXT_PUBLIC_API_ENTRYPOINT,
  httpClient: (url: URL, options = {}) =>
    fetchHydra(url, {
      ...options,
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }),
  apiDocumentationParser: apiDocumentationParser(getAccessToken()),
});
