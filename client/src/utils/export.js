import { buildExportText } from "./chat.js";

export const exportChatAsTxt = ({ title, messages }) => {
  const blob = new Blob([buildExportText(messages)], {
    type: "text/plain;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title || "chat"}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportChatAsPdf = ({ title, messages }) => {
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(buildExportText(messages), 180);
    doc.setFont("helvetica", "bold");
    doc.text(title || "Chat Export", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.text(lines, 14, 32);
    doc.save(`${title || "chat"}.pdf`);
  });
};
