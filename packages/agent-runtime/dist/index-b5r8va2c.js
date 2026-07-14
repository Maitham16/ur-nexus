import {
  init_AppState,
  useAppState
} from "./index-79vhy4mk.js";
import {
  require_react
} from "./index-2krq0sbw.js";
import {
  getDefaultMainLoopModelSetting,
  init_growthbook,
  init_model,
  onGrowthBookRefresh,
  parseUserSpecifiedModel
} from "./index-133awary.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/hooks/useMainLoopModel.ts
function useMainLoopModel() {
  const mainLoopModel = useAppState((s) => s.mainLoopModel);
  const mainLoopModelForSession = useAppState((s) => s.mainLoopModelForSession);
  const [, forceRerender] = import_react.useReducer((x) => x + 1, 0);
  import_react.useEffect(() => onGrowthBookRefresh(forceRerender), []);
  const model = parseUserSpecifiedModel(mainLoopModelForSession ?? mainLoopModel ?? getDefaultMainLoopModelSetting());
  return model;
}
var import_react;
var init_useMainLoopModel = __esm(() => {
  init_growthbook();
  init_AppState();
  init_model();
  import_react = __toESM(require_react(), 1);
});

export { useMainLoopModel, init_useMainLoopModel };
