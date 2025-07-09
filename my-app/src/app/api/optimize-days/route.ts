import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
  const body = await req.json();

  return new Promise((resolve) => {
    const py = spawn("python3", ["meal-solver/solver.py"]); // adjust path if needed

    let result = "";
    let error = "";

    py.stdin.write(JSON.stringify(body));
    py.stdin.end();

    py.stdout.on("data", (data) => (result += data.toString()));
    py.stderr.on("data", (data) => (error += data.toString()));

    py.on("close", () => {
      if (error && !result.trim()) {
        console.error("❌ Solver error:\n", error);
        resolve(
          NextResponse.json(
            { error: "Solver error", details: error },
            { status: 500 }
          )
        );
        return;
      }

      console.log("🐍 Raw solver output:", result);

      try {
        // Try to find the first valid JSON object in the result
        const jsonStart = result.indexOf("{");
        const jsonEnd = result.lastIndexOf("}");

        if (jsonStart === -1 || jsonEnd === -1)
          throw new Error("No JSON found in output");

        const jsonString = result.slice(jsonStart, jsonEnd + 1);

        const parsed = JSON.parse(jsonString);
        resolve(NextResponse.json(parsed));
      } catch (err) {
        console.error("❌ JSON parse error:", err);
        resolve(
          NextResponse.json(
            { error: "Failed to parse solver output" },
            { status: 500 }
          )
        );
      }
    });
  });
}
