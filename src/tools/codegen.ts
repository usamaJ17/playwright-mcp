import { z } from "zod";

// ----- Types -----
interface CodegenAction {
  toolName: string;
  parameters: Record<string, unknown>;
  timestamp: number;
  result?: unknown;
}

interface CodegenSession {
  id: string;
  actions: CodegenAction[];
  startTime: number;
  endTime?: number;
  options?: CodegenOptions;
}

interface CodegenOptions {
  outputPath?: string;
  testNamePrefix?: string;
  includeComments?: boolean;
}

// ----- In-memory session store -----
const sessions: Map<string, CodegenSession> = new Map();

// ----- Tool: start_codegen_session -----
const start_codegen_session = {
  name: "start_codegen_session",
  description: "Start a new code generation session to record Playwright actions",
  inputSchema: z.object({
    options: z.object({
      outputPath: z.string(),
      testNamePrefix: z.string().optional(),
      includeComments: z.boolean().optional(),
    }),
  }),
  async handle({ options }: { options: CodegenOptions }) {
    const sessionId = Math.random().toString(36).substring(2, 12);
    const session: CodegenSession = {
      id: sessionId,
      actions: [],
      startTime: Date.now(),
      options,
    };
    sessions.set(sessionId, session);
    return { sessionId };
  }
};

// ----- Tool: get_codegen_session -----
const get_codegen_session = {
  name: "get_codegen_session",
  description: "Get information about a code generation session",
  inputSchema: z.object({
    sessionId: z.string(),
  }),
  async handle({ sessionId }: { sessionId: string }) {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return session;
  }
};

// ----- Tool: clear_codegen_session -----
const clear_codegen_session = {
  name: "clear_codegen_session",
  description: "Clear a code generation session without generating a test",
  inputSchema: z.object({
    sessionId: z.string(),
  }),
  async handle({ sessionId }: { sessionId: string }) {
    if (!sessions.has(sessionId)) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    sessions.delete(sessionId);
    return { cleared: true };
  }
};

// ----- Tool: end_codegen_session (stub for now) -----
const end_codegen_session = {
  name: "end_codegen_session",
  description: "End a code generation session and generate the test file",
  inputSchema: z.object({
    sessionId: z.string(),
  }),
  async handle({ sessionId }: { sessionId: string }) {
    // TODO: Implement test generation logic
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    session.endTime = Date.now();
    // For now, just return a stub
    return {
      filePath: "/path/to/generated/test.spec.ts",
      testCode: "// Generated Playwright test code will appear here.",
      sessionId,
    };
  }
};

// ----- Export all codegen Tools in an array -----
export const codegen = [
  start_codegen_session,
  end_codegen_session,
  get_codegen_session,
  clear_codegen_session,
];