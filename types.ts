
export interface CategoryValue {
  code: string;
  name: string;
  value: number;
  unit: string;
  note?: string;
}

export interface TrainingCategory {
  code: string;
  title: string;
  total: number;
  unit: string;
  description: string;
}

export interface AnalysisResult {
  cycle_summary: {
    total_duration_hours: number;
    total_km_voda: number;
    total_km_beh: number;
    main_focus: string;
    categories: TrainingCategory[];
  };
  individual_plans: {
    plan_name: string;
    categories: TrainingCategory[];
  }[];
}
