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
        const parsed = JSON.parse(result);
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
