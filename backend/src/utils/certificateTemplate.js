
const { createCanvas } = require("canvas");

const WIDTH = 1600;
const HEIGHT = 1000;

const safeText = (value, fallback = "") =>
  String(value ?? fallback).trim();

const fitText = (ctx, text, maxWidth, font) => {
  ctx.font = font;
  let output = safeText(text);

  if (ctx.measureText(output).width <= maxWidth) {
    return output;
  }

  while (output.length > 3 && ctx.measureText(`${output}…`).width > maxWidth) {
    output = output.slice(0, -1);
  }

  return `${output}…`;
};

const drawCenteredText = (ctx, text, y, font, maxWidth) => {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    fitText(ctx, text, maxWidth, font),
    WIDTH / 2,
    y
  );
};

const drawWrappedCenteredText = (
  ctx,
  text,
  startY,
  maxWidth,
  lineHeight,
  font,
  maxLines = 2
) => {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (words.length && lines.length === maxLines) {
    const used = lines.join(" ");
    if (used.length < safeText(text).length) {
      lines[maxLines - 1] = fitText(
        ctx,
        lines[maxLines - 1],
        maxWidth,
        font
      );
    }
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, WIDTH / 2, startY + index * lineHeight);
  });

  return startY + lines.length * lineHeight;
};

const renderCertificateJpeg = async ({
  studentName,
  courseTitle,
  instructorName,
  certificateNo,
  issuedAt,
}) => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Clean white paper background for a printable certificate.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // EduPond double border.
  ctx.strokeStyle = "#183153";
  ctx.lineWidth = 14;
  ctx.strokeRect(45, 45, WIDTH - 90, HEIGHT - 90);
  ctx.strokeStyle = "#c8a951";
  ctx.lineWidth = 4;
  ctx.strokeRect(70, 70, WIDTH - 140, HEIGHT - 140);

  // Brand mark.
  ctx.fillStyle = "#183153";
  drawCenteredText(ctx, "EDU POND", "150", "bold 42px sans-serif", 1200);

  ctx.fillStyle = "#222222";
  drawCenteredText(
    ctx,
    "CERTIFICATE OF COMPLETION",
    235,
    "bold 70px Georgia, serif",
    1400
  );

  ctx.fillStyle = "#555555";
  drawCenteredText(
    ctx,
    "This certificate is proudly presented to",
    330,
    "28px sans-serif",
    1200
  );

  ctx.fillStyle = "#183153";
  drawCenteredText(
    ctx,
    studentName,
    430,
    "bold 64px Georgia, serif",
    1300
  );

  ctx.strokeStyle = "#c8a951";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(430, 485);
  ctx.lineTo(1170, 485);
  ctx.stroke();

  ctx.fillStyle = "#555555";
  drawCenteredText(
    ctx,
    "has successfully completed the course",
    550,
    "28px sans-serif",
    1200
  );

  ctx.fillStyle = "#222222";
  drawWrappedCenteredText(
    ctx,
    courseTitle,
    610,
    1250,
    58,
    "bold 48px sans-serif",
    2
  );

  // Footer metadata.
  ctx.fillStyle = "#555555";
  ctx.font = "22px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Certificate No: ${safeText(certificateNo)}`, 150, 850);

  const dateText = new Date(issuedAt || Date.now()).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  ctx.fillText(`Issued: ${dateText}`, 150, 890);

  ctx.textAlign = "center";
  ctx.font = "22px sans-serif";
  ctx.fillText(
    `Instructor: ${fitText(ctx, instructorName || "EduPond Instructor", 430, "22px sans-serif")}`,
    WIDTH / 2,
    875
  );

  // Decorative seal.
  ctx.strokeStyle = "#c8a951";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(1360, 835, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#183153";
  ctx.font = "bold 25px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EDU", 1360, 825);
  ctx.fillText("POND", 1360, 855);

  return canvas.toBuffer("image/jpeg", {
    quality: 0.92,
    progressive: true,
  });
};

module.exports = {
  renderCertificateJpeg,
};
