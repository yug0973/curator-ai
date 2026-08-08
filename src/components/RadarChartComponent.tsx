import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { RadarDimension } from "../types/index.js";

interface RadarChartComponentProps {
  radarScores: Record<string, RadarDimension>;
  updatedRadar?: Record<string, RadarDimension> | null;
}

export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  radarScores,
  updatedRadar,
}) => {
  // Use updatedRadar if available, otherwise radarScores
  const activeScores = updatedRadar || radarScores;

  if (!activeScores || Object.keys(activeScores).length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-400 text-[13px]">
        No radar data available.
      </div>
    );
  }

  const chartData = Object.keys(activeScores).map((key) => ({
    subject: key,
    Current: activeScores[key].current,
    Goal: activeScores[key].goal,
  }));

  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#e5e5e5" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#525252", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#e5e5e5"
            tick={{ fontSize: 10, fill: "#a3a3a3" }}
          />
          <Radar
            name="Goal"
            dataKey="Goal"
            stroke="#a3a3a3"
            fill="#a3a3a3"
            fillOpacity={0.12}
            strokeDasharray="4 4"
            isAnimationActive={true}
            animationDuration={800}
          />
          <Radar
            name="Current"
            dataKey="Current"
            stroke="#171717"
            fill="#171717"
            fillOpacity={0.15}
            isAnimationActive={true}
            animationDuration={1000}
          />
          <Legend
            wrapperStyle={{ paddingTop: "12px", fontSize: "12px", color: "#737373" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "12px",
              color: "#171717",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
