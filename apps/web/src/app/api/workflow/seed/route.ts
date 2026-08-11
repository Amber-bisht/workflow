import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@nextflow/database";

const SAMPLE_NODES = [
  {
    id: "request_inputs_1",
    type: "RequestInputs",
    position: { x: 60, y: 220 },
    deletable: false,
    data: {
      fields: [
        {
          id: "text_field",
          name: "text_field",
          type: "text",
          value:
            "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
        },
        {
          id: "image_field",
          name: "image_field",
          type: "image",
          value: "https://8mm.in/cdn/shop/files/Bowers_Wilkins_PX7_S3_Headphone_black.webp?v=1759395622&width=900",
        },
      ],
    },
  },
  {
    id: "cropimage_1",
    type: "CropImage",
    position: { x: 400, y: 60 },
    data: { x: 20, y: 20, w: 60, h: 60 },
  },
  {
    id: "cropimage_2",
    type: "CropImage",
    position: { x: 400, y: 320 },
    data: { x: 0, y: 0, w: 100, h: 50 },
  },
  {
    id: "gemini_1",
    type: "Gemini",
    position: { x: 400, y: 560 },
    data: {
      model: "gemini-1.5-flash",
      systemPrompt:
        "You are a marketing copywriter. Write a one-paragraph product description.",
      prompt: "",
      temperature: 0.7,
    },
  },
  {
    id: "gemini_2",
    type: "Gemini",
    position: { x: 760, y: 560 },
    data: {
      model: "gemini-1.5-flash",
      systemPrompt:
        "Condense the following product description into a tweet-length hook (under 240 characters). Do not output any markdown, introductory, or conversational text. Output only the hook text itself.",
      prompt: "",
      temperature: 0.7,
    },
  },
  {
    id: "gemini_3",
    type: "Gemini",
    position: { x: 1080, y: 200 },
    data: {
      model: "gemini-1.5-flash",
      systemPrompt:
        "You are a social media manager. Combine the tweet hook and the two product crops into a final marketing post. Do not output any introductory or conversational text. Output only the plain-text body of the marketing post itself.",
      prompt: "",
      temperature: 0.7,
    },
  },
  {
    id: "response_1",
    type: "Response",
    position: { x: 1440, y: 220 },
    deletable: false,
    data: {},
  },
];

const SAMPLE_EDGES = [
  {
    id: "e1",
    source: "request_inputs_1",
    sourceHandle: "image_field",
    target: "cropimage_1",
    targetHandle: "inputImage",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2.5 },
  },
  {
    id: "e2",
    source: "request_inputs_1",
    sourceHandle: "image_field",
    target: "cropimage_2",
    targetHandle: "inputImage",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2.5 },
  },
  {
    id: "e3",
    source: "request_inputs_1",
    sourceHandle: "text_field",
    target: "gemini_1",
    targetHandle: "prompt",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2.5 },
  },
  {
    id: "e4",
    source: "gemini_1",
    sourceHandle: "response",
    target: "gemini_2",
    targetHandle: "prompt",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2.5 },
  },
  {
    id: "e5",
    source: "cropimage_1",
    sourceHandle: "outputImage",
    target: "gemini_3",
    targetHandle: "image",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2.5 },
  },
  {
    id: "e6",
    source: "cropimage_2",
    sourceHandle: "outputImage",
    target: "gemini_3",
    targetHandle: "image",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2.5 },
  },
  {
    id: "e7",
    source: "gemini_2",
    sourceHandle: "response",
    target: "gemini_3",
    targetHandle: "prompt",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2.5 },
  },
  {
    id: "e8",
    source: "gemini_3",
    sourceHandle: "response",
    target: "response_1",
    targetHandle: "result",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2.5 },
  },
];

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workflow = await prisma.workflow.create({
      data: {
        userId: session.user.id,
        name: "AI Headphones Market Campaign",
        description: "LLM and Image Cropping multi-node workspace for headphones marketing campaign",
        nodes: SAMPLE_NODES as any,
        edges: SAMPLE_EDGES as any,
      },
    });

    return NextResponse.json({ success: true, workflowId: workflow.id });
  } catch (err: any) {
    console.error("[Seed] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
