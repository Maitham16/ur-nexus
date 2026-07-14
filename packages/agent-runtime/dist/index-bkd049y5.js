import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/xml.ts
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeXmlAttr(s) {
  return escapeXml(s).replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
var init_xml = () => {};

export { escapeXml, escapeXmlAttr, init_xml };
