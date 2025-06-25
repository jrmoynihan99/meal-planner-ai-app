"use client";

import { useAppStore } from "@/lib/store";
import type { Phase } from "@/lib/store";

export function extractPhaseFromMessage(content: string) {
  const match = content.match(/\[START_PHASE\](\w+)\[END_PHASE\]/i);

  if (match) {
    const newPhase = match[1] as Phase;
    const currentPhase = useAppStore.getState().currentPhase;

    if (newPhase !== currentPhase) {
      console.log(`🔄 Phase updated from "${currentPhase}" to "${newPhase}"`);
      useAppStore.getState().setPhase(newPhase);
    } else {
      console.log("ℹ️ Phase matches current. No update needed.");
    }
  } else {
    console.warn("⚠️ No [START_PHASE] tag found in message.");
  }
}
