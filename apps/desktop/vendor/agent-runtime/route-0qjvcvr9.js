import {
  formatRoute,
  init_intentRouter,
  routeIntent
} from "./index-hakw7em9.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/route/route.ts
var call = async (args) => {
  const json = /(^|\s)--json(\s|$)/.test(args);
  const task = args.replace(/(^|\s)--json(\s|$)/, " ").trim();
  if (!task) {
    return {
      type: "text",
      value: 'Usage: ur route "<task>" [--json]'
    };
  }
  const result = routeIntent(task);
  return { type: "text", value: formatRoute(result, json) };
};
var init_route = __esm(() => {
  init_intentRouter();
});
init_route();

export {
  call
};
