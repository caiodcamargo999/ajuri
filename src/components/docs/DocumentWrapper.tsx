import React from "react";

interface DocumentWrapperProps {
  children: React.ReactNode;
}

export const DocumentWrapper: React.FC<DocumentWrapperProps> = ({ children }) => {
  return (
    <div
      className="bg-white text-black mx-auto shadow-2xl relative"
      style={{
        width: "794px",
        minHeight: "1123px", // A4 standard pixel size at 96 DPI
        padding: "94px 76px 94px 113px", // A4 standard margins
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "13pt",
        lineHeight: "1.5",
        boxSizing: "border-box"
      }}
    >
      <div className="relative z-10 w-full h-full text-justify">
        {children}
      </div>
    </div>
  );
};
