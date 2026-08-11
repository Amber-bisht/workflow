import RequestInputsNode from "./RequestInputsNode";
import CropImageNode from "./CropImageNode";
import OpenRouterNode from "./OpenRouterNode";
import ResponseNode from "./ResponseNode";
import TavilySearchNode from "./TavilySearchNode";
import WebsiteMonitorNode from "./WebsiteMonitorNode";
import TelegramNode from "./TelegramNode";
import ResendEmailNode from "./ResendEmailNode";

export const nodeTypes = {
  RequestInputs: RequestInputsNode,
  CropImage: CropImageNode,
  Gemini: OpenRouterNode,
  OpenRouter: OpenRouterNode,
  LLM: OpenRouterNode,
  Response: ResponseNode,
  TavilySearch: TavilySearchNode,
  WebsiteMonitor: WebsiteMonitorNode,
  Telegram: TelegramNode,
  ResendEmail: ResendEmailNode,
};
