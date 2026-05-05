import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withErrorHandling, json, methodNotAllowed } from "../src/api/_lib/http";

// Import all endpoint handlers
import bootstrapHandler from "../src/api/bootstrap";
import healthHandler from "../src/api/health";
import schoolHandler from "../src/api/school";
import settingsHandler from "../src/api/settings";

import alumniIndexHandler from "../src/api/alumni/index";
import alumniIdHandler from "../src/api/alumni/[id]";

import analyticsDashboardHandler from "../src/api/analytics/dashboard";

import authCompleteSetupHandler from "../src/api/auth/complete-setup";
import authLoginHandler from "../src/api/auth/login";
import authLogoutHandler from "../src/api/auth/logout";
import authMeHandler from "../src/api/auth/me";
import authSetupHandler from "../src/api/auth/setup";

import blobUploadHandler from "../src/api/blob/upload";

import systemDummyHandler from "../src/api/system/dummy";
import systemExportHandler from "../src/api/system/export";
import systemLogHandler from "../src/api/system/log";
import systemResetHandler from "../src/api/system/reset";

import teachersIndexHandler from "../src/api/teachers/index";
import teachersIdHandler from "../src/api/teachers/[id]";

import userPreferencesHandler from "../src/api/user/preferences";
import visitorTrackHandler from "../src/api/visitor/track";

import yearbooksIndexHandler from "../src/api/yearbooks/index";
import yearbooksIdHandler from "../src/api/yearbooks/[id]";

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
