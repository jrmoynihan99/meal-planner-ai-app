// /app/api/generate-spreadsheet/route.js
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { calorie_target, protein_target, days } = body;

    const wb = XLSX.utils.book_new();
    const summaryData = [
      ["Daily Calorie Target", calorie_target || "Not specified"],
      ["Daily Protein Target", protein_target || "Not specified"],
      [""],
      ["Day", "Total Calories", "Total Protein", "# of Meals"],
    ];

    Object.entries(days).forEach(([day, meals]) => {
      let dayCalories = 0;
      let dayProtein = 0;

      meals.forEach((meal) => {
        meal.ingredients?.forEach((ing) => {
          dayCalories += ing.calories || 0;
          dayProtein += ing.protein || 0;
        });
      });

      summaryData.push([day, dayCalories, dayProtein, meals.length]);

      const dayData = [
        ["Meal Name", "Ingredient", "Quantity", "Unit", "Calories", "Protein"],
      ];

      meals.forEach((meal) => {
        meal.ingredients?.forEach((ing, index) => {
          dayData.push([
            index === 0 ? meal.meal_name : "",
            ing.name,
            ing.quantity,
            ing.unit,
            ing.calories,
            ing.protein,
          ]);
        });
        dayData.push(["", "", "", "", "", ""]);
      });

      const dayWs = XLSX.utils.aoa_to_sheet(dayData);
      XLSX.utils.book_append_sheet(wb, dayWs, day);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const base64Buffer = buffer.toString("base64");

    const fileId = uuidv4();
    await kv.set(fileId, base64Buffer, { ex: 3600 });

    return NextResponse.json(
      {
        success: true,
        download_url: `https://meal-planner-ai-app.vercel.app/api/download/${fileId}`,
        filename: "meal-plan.xlsx",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate spreadsheet" },
      { status: 500 }
    );
  }
}
