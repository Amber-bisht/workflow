import RequestInputsNode from "./RequestInputsNode";
import CropImageNode from "./CropImageNode";
import OpenRouterNode from "./OpenRouterNode";
import ResponseNode from "./ResponseNode";

export const nodeTypes = {
  RequestInputs: RequestInputsNode,
  CropImage: CropImageNode,
  Gemini: OpenRouterNode,
  OpenRouter: OpenRouterNode,
  LLM: OpenRouterNode,
  Response: ResponseNode,
};
