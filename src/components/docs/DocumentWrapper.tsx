import React from "react";

interface DocumentWrapperProps {
  children: React.ReactNode;
}

export const DocumentWrapper: React.FC<DocumentWrapperProps> = ({ children }) => {
  return (
    <div
      className="bg-white text-black mx-auto shadow-2xl relative"
      style={{
        width: "210mm",
        minHeight: "297mm", // A4
        padding: "25mm 20mm 25mm 30mm", // Standard A4 margins
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "13pt",
        lineHeight: "1.5",
        // Setup background image for letterhead
        backgroundImage: "url('/papel-timbrado.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxSizing: "border-box"
      }}
    >
      <div className="relative z-10 w-full h-full text-justify">
        {children}
      </div>
    </div>
  );
};
