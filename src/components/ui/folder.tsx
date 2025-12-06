"use client";

import React from "react";

interface FolderProps {
  color?: string;
  size?: number;
  className?: string;
  active?: boolean;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const Folder: React.FC<FolderProps> = ({
  color = "#5227FF",
  size = 1,
  className = "",
  active = false,
}) => {
  const folderBackColor = darkenColor(color, 0.08);
  const scaleStyle = { transform: `scale(${size})` };

  return (
    <div style={scaleStyle} className={className}>
      <div
        className={`group relative cursor-pointer transition-all duration-200 ease-in ${
          !active ? "hover:-translate-y-2" : "-translate-y-2"
        }`}
        style={{
          transform: active ? "translateY(-8px)" : undefined,
        }}
      >
        <div
          className="relative h-[80px] w-[100px] rounded-tl-0 rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"
          style={{ backgroundColor: folderBackColor }}
        >
          <span
            className="absolute bottom-[98%] left-0 h-[10px] w-[30px] rounded-tl-[5px] rounded-tr-[5px]"
            style={{ backgroundColor: folderBackColor }}
          />
          <div
            className={`absolute z-30 h-full w-full origin-bottom transition-all duration-300 ease-in-out ${
              !active ? "group-hover:[transform:skew(15deg)_scaleY(0.6)]" : ""
            }`}
            style={{
              backgroundColor: color,
              borderRadius: "5px 10px 10px 10px",
              ...(active && { transform: "skew(15deg) scaleY(0.6)" }),
            }}
          />
          <div
            className={`absolute z-30 h-full w-full origin-bottom transition-all duration-300 ease-in-out ${
              !active ? "group-hover:[transform:skew(-15deg)_scaleY(0.6)]" : ""
            }`}
            style={{
              backgroundColor: color,
              borderRadius: "5px 10px 10px 10px",
              ...(active && { transform: "skew(-15deg) scaleY(0.6)" }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Folder;
