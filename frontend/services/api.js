import { Platform } from "react-native";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  }

  return "http://localhost:5000";
};

const API_BASE_URL = getBaseUrl();

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (err) {
    return { raw: text };
  }
};

const request = async (path, { expectsJson = true, ...options } = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await parseJsonSafely(response);
    const message = payload?.error || payload?.message || response.statusText;
    const error = new Error(message || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (!expectsJson) {
    return null;
  }

  const payload = await parseJsonSafely(response);
  return payload;
};

export const fetchDocuments = async () => {
  const data = await request("/documents");
  return data.documents || [];
};

export const fetchDocument = async (id) => {
  const data = await request(`/documents/${id}`);
  return data.document;
};

export const deleteDocument = async (id) => {
  await request(`/documents/${id}`, { method: "DELETE", expectsJson: false });
};

export const createTextDocument = async ({ title, text, note, source }) => {
  const payload = await request("/documents/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, text, note, source }),
  });

  return payload.document;
};

export const uploadDocument = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const mimeType = file.type || file.mimeType || "";
  const endpoint = mimeType.includes("pdf") ? "/upload/pdf" : "/upload/image";

  const data = await request(endpoint, {
    method: "POST",
    body: form,
  });

  return data.document;
};

export const rewriteSentence = async ({ sentence, keepTerms }) => {
  const data = await request("/ai/rewrite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sentence, keepTerms }),
  });

  return data.candidates || [];
};

export const apiBaseUrl = API_BASE_URL;
