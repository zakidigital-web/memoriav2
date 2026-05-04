import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "./_lib/http";

// Import all endpoint handlers
import bootstrapHandler from "./bootstrap";
import healthHandler from "./health";
import schoolHandler from "./school";
import settingsHandler from "./settings";

import alumniIndexHandler from "./alumni/index";
import alumniIdHandler from "./alumni/[id]";

import analyticsDashboardHandler from "./analytics/dashboard";

import authCompleteSetupHandler from "./auth/complete-setup";
import authLoginHandler from "./auth/login";
import authLogoutHandler from "./auth/logout";
import authMeHandler from "./auth/me";
import authSetupHandler from "./auth/setup";

import blobUploadHandler from "./blob/upload";

import systemDummyHandler from "./system/dummy";
import systemExportHandler from "./system/export";
import systemLogHandler from "./system/log";
import systemResetHandler from "./system/reset";

import teachersIndexHandler from "./teachers/index";
import teachersIdHandler from "./teachers/[id]";

import userPreferencesHandler from "./user/preferences";
import visitorTrackHandler from "./visitor/track";

import yearbooksIndexHandler from "./yearbooks/index";
import yearbooksIdHandler from "./yearbooks/[id]";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract path without the '/api' prefix and query string
  const url = req.url || "/";
  const path = url.split("?")[0].replace(/^\/api/, "");
  const parts = path.split("/").filter(Boolean);

  // Helper to extract ID for dynamic routes
  const handleDynamicRoute = (handlerFn: any, idIndex: number) => {
    if (!req.query) req.query = {};
    req.query.id = parts[idIndex];
    return handlerFn(req, res);
  };

  // Route matching
  if (parts.length === 0) return json(res, 200, { status: "API is running" });

  if (parts[0] === "health" && parts.length === 1) return healthHandler(req, res);
  if (parts[0] === "bootstrap" && parts.length === 1) return bootstrapHandler(req, res);
  if (parts[0] === "school" && parts.length === 1) return schoolHandler(req, res);
  if (parts[0] === "settings" && parts.length === 1) return settingsHandler(req, res);

  if (parts[0] === "auth") {
    if (parts[1] === "me" && parts.length === 2) return authMeHandler(req, res);
    if (parts[1] === "login" && parts.length === 2) return authLoginHandler(req, res);
    if (parts[1] === "logout" && parts.length === 2) return authLogoutHandler(req, res);
    if (parts[1] === "setup" && parts.length === 2) return authSetupHandler(req, res);
    if (parts[1] === "complete-setup" && parts.length === 2) return authCompleteSetupHandler(req, res);
  }

  if (parts[0] === "user") {
    if (parts[1] === "preferences" && parts.length === 2) return userPreferencesHandler(req, res);
  }

  if (parts[0] === "blob") {
    if (parts[1] === "upload" && parts.length === 2) return blobUploadHandler(req, res);
  }

  if (parts[0] === "system") {
    if (parts[1] === "dummy" && parts.length === 2) return systemDummyHandler(req, res);
    if (parts[1] === "export" && parts.length === 2) return systemExportHandler(req, res);
    if (parts[1] === "log" && parts.length === 2) return systemLogHandler(req, res);
    if (parts[1] === "reset" && parts.length === 2) return systemResetHandler(req, res);
  }
  
  if (parts[0] === "analytics") {
    if (parts[1] === "dashboard" && parts.length === 2) return analyticsDashboardHandler(req, res);
  }

  if (parts[0] === "visitor") {
    if (parts[1] === "track" && parts.length === 2) return visitorTrackHandler(req, res);
  }

  if (parts[0] === "teachers") {
    if (parts.length === 1) return teachersIndexHandler(req, res);
    if (parts.length === 2) return handleDynamicRoute(teachersIdHandler, 1);
  }

  if (parts[0] === "alumni") {
    if (parts.length === 1) return alumniIndexHandler(req, res);
    if (parts.length === 2) return handleDynamicRoute(alumniIdHandler, 1);
  }

  if (parts[0] === "yearbooks") {
    if (parts.length === 1) return yearbooksIndexHandler(req, res);
    if (parts.length === 2) return handleDynamicRoute(yearbooksIdHandler, 1);
  }

  return json(res, 404, { error: "Not Found" });
}
