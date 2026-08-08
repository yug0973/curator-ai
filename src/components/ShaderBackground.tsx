import React from "react";
import { ShaderBackground as IstanblueShader } from "./ui/istanblue.js";

export const ShaderBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <IstanblueShader className="w-full h-full" />
    </div>
  );
};
