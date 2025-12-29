
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeTrainingImages = async (base64Images: string[]): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Jsi expert na analýzu tréninkových plánů kanoistického oddílu Sparta Praha. 
    Tvým úkolem je extrahovat data z tabulky "Tréninkový plán".

    DŮLEŽITÉ: Pokud je souhrnná tabulka na spodku stránky prázdná nebo obsahuje nuly (0), MUSÍŠ spočítat hodnoty z textových popisů v buňkách "Dopolední Trénink" a "Odpolední Trénink" pro každý den (Pondělí až Neděle).

    Klíč pro kategorie (OTU a STU):
    - 101 V-C: Voda celkem (km) - sečti všechny km na vodě.
    - 102 V-R: Voda rychlost (km) - úseky do 200m v maximální intenzitě.
    - 103 V-TT: Voda traťové tempo (km) - úseky do 1000m.
    - 104 RV: RV (počítej pouze u tréninku voda, ne trenažér, bazén a dalš. Může být ve vteřinách(příklad: 40“), nebo v minutách(příklad: 1') vzdálenost počítej podle tohoto pravidla: 1 minuta = 200m).
    - 105 PV: PV (počítej pouze u tréninku voda, ne trenažér, bazén a další. Může být ve vteřinách(příklad: 40“), nebo v minutách(příklad: 1') vzdálenost počítej podle tohoto pravidla: 1 minuta = 150m).
    - 106 POS: Celkový čas posilování (v hodinách). Hledej "posilování", "benč", "kruhák", "aktivace".
    - 107 SPEC POS: Speciální posilování (pádlovací bazén, trenažér s brzdou).
    - 108 B-C: Běh celkem (km) - sečti všechny "běh 4km", "běh 8km" atd.
    - 109 B-Ú: Běh úseky (km).
    - 110 B-V: Běh vytrvalost (km).
    - 111 PL: Plavání (vždy když je plavání, plave se přesně JEDNU HODINU, NE VÍC NE MÍŇ).
    - 112 OST: Ostatní (kolo, brusle) - čas v hodinách.
    - 113 SH: Sportovní hry (fotbal, hry) - čas v hodinách.
    - 114 KOM: Kompenzační cvičení, strečink (v hodinách).
    - 118 ČZ: Celkový čas zátěže (v hodinách). Pokud není uveden, odhadni (trénink cca 1-1.5h).

    PRAVIDLA PRO VÝPOČET:
    1. Vypočítávej VŽDY CELKOVÉ HODNOTY pro celou skupinu. Nerozlišuj mezi kluky a holkami.
    2. Pokud vidíš "běh 4km", přičti 4 do kategorie 108.
    3. Pokud vidíš "voda 4-6km", vezmi průměr (5km) nebo horní hranici a přičti do 101.
    4. "minuty" převáděj na "hodiny" (děleno 60) pro kategorie v hodinách (106, 111, 112, 113, 114, 118).
    5. Ignoruj dny označené jako "volno".

    Vrať data v JSON formátu podle definovaného schématu.
  `;

  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64.split(',')[1],
    },
  }));

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          { text: prompt },
          ...imageParts
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cycle_summary: {
            type: Type.OBJECT,
            properties: {
              total_duration_hours: { type: Type.NUMBER },
              total_km_voda: { type: Type.NUMBER },
              total_km_beh: { type: Type.NUMBER },
              main_focus: { type: Type.STRING },
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    code: { type: Type.STRING },
                    title: { type: Type.STRING },
                    total: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["code", "title", "total", "unit"]
                }
              }
            },
            required: ["total_duration_hours", "total_km_voda", "total_km_beh", "categories"]
          },
          individual_plans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                plan_name: { type: Type.STRING },
                categories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      code: { type: Type.STRING },
                      title: { type: Type.STRING },
                      total: { type: Type.NUMBER },
                      unit: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["cycle_summary", "individual_plans"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AnalysisResult;
};
