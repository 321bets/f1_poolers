import { Bet, Event, Round } from '../types';

/**
 * Generate a styled bet slip image using Canvas API
 */
export async function generateBetSlipImage(
  bet: Bet,
  event: Event,
  round: Round,
  username: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const W = 600;

  const hasDrivers = bet.predictions && bet.predictions.length > 0;
  const hasTeams = bet.teamPredictions && bet.teamPredictions.length > 0;
  const driverCount = hasDrivers ? bet.predictions.length : 0;
  const teamCount = hasTeams ? bet.teamPredictions.length : 0;

  // Calculate dynamic height
  let H = 100; // header
  H += 80;     // event info block
  H += 20;     // spacing
  if (hasDrivers) H += 40 + driverCount * 52; // section header + rows
  if (hasDrivers && hasTeams) H += 20; // gap between sections
  if (hasTeams) H += 40 + teamCount * 52;
  H += 30;     // spacing
  H += 50;     // multiplier bar
  H += 50;     // footer
  H += 20;     // bottom padding

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 30) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
  }
  for (let i = 0; i < H; i += 30) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
  }

  // ── Header bar ──
  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, '#DC2626');
  headerGrad.addColorStop(1, '#991B1B');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, 90);

  // Diagonal accent
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(W - 200, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 90); ctx.lineTo(W - 260, 90);
  ctx.closePath(); ctx.fill();

  // Title text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold italic 32px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('F1™ POOLERS', 28, 42);

  ctx.font = 'bold 13px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('PREDICTION SLIP', 28, 65);

  // Username badge
  ctx.font = 'bold 14px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const usernameText = `@${username}`;
  const tw = ctx.measureText(usernameText).width;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(ctx, W - tw - 44, 52, tw + 24, 28, 4);
  ctx.fill();
  ctx.fillStyle = '#FBBF24';
  ctx.fillText(usernameText, W - tw - 32, 72);

  let y = 105;

  // ── Event info block ──
  ctx.fillStyle = '#1F2937';
  roundRect(ctx, 20, y, W - 40, 70, 8);
  ctx.fill();
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  roundRect(ctx, 20, y, W - 40, 70, 8);
  ctx.stroke();

  // Event type badge
  const typeColor = event.type === 'Qualifying' ? '#7C3AED' 
    : event.type === 'Sprint Race' ? '#2563EB' : '#DC2626';
  ctx.fillStyle = typeColor;
  roundRect(ctx, 32, y + 12, ctx.measureText(event.type).width + 24, 24, 4);
  ctx.fill();
  ctx.font = 'bold 12px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(event.type, 44, y + 29);

  // Round name
  ctx.font = 'bold 18px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(round.name, 32, y + 56);

  // Circuit info (right side)
  ctx.font = '12px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.textAlign = 'right';
  ctx.fillText(round.circuit, W - 32, y + 30);
  ctx.fillText(round.location, W - 32, y + 50);
  ctx.textAlign = 'left';

  y += 90;

  // ── Driver Predictions ──
  if (hasDrivers) {
    ctx.font = 'bold 11px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('▌ DRIVER PREDICTIONS', 28, y + 8);
    y += 25;

    for (let i = 0; i < driverCount; i++) {
      const driver = bet.predictions[i];
      const isOdd = i % 2 === 0;

      // Row background
      ctx.fillStyle = isOdd ? 'rgba(31,41,55,0.6)' : 'rgba(17,24,39,0.3)';
      roundRect(ctx, 20, y, W - 40, 46, 6);
      ctx.fill();

      // Position badge
      const posColors = ['#EAB308', '#9CA3AF', '#CD7F32', '#6B7280', '#6B7280'];
      ctx.fillStyle = posColors[i] || '#6B7280';
      roundRect(ctx, 30, y + 8, 32, 30, 4);
      ctx.fill();
      ctx.font = 'bold 16px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(`P${i + 1}`, 46, y + 29);
      ctx.textAlign = 'left';

      // Driver number
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(`#${driver.number}`, 72, y + 20);

      // Driver name
      ctx.font = 'bold 16px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(driver.name, 110, y + 24);

      // Team name
      ctx.font = '11px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(driver.teamName, 110, y + 40);

      y += 52;
    }
  }

  // ── Team Predictions ──
  if (hasTeams) {
    if (hasDrivers) y += 15;

    ctx.font = 'bold 11px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('▌ TEAM PREDICTIONS', 28, y + 8);
    y += 25;

    for (let i = 0; i < teamCount; i++) {
      const team = bet.teamPredictions[i];
      const isOdd = i % 2 === 0;

      ctx.fillStyle = isOdd ? 'rgba(31,41,55,0.6)' : 'rgba(17,24,39,0.3)';
      roundRect(ctx, 20, y, W - 40, 46, 6);
      ctx.fill();

      // Position badge
      const posColors = ['#EAB308', '#9CA3AF', '#CD7F32', '#6B7280', '#6B7280'];
      ctx.fillStyle = posColors[i] || '#6B7280';
      roundRect(ctx, 30, y + 8, 32, 30, 4);
      ctx.fill();
      ctx.font = 'bold 16px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(`P${i + 1}`, 46, y + 29);
      ctx.textAlign = 'left';

      // Team name
      ctx.font = 'bold 16px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(team.name, 80, y + 30);

      y += 52;
    }
  }

  y += 20;

  // ── Multiplier bar ──
  ctx.fillStyle = '#1F2937';
  roundRect(ctx, 20, y, W - 40, 44, 8);
  ctx.fill();
  ctx.strokeStyle = '#374151';
  roundRect(ctx, 20, y, W - 40, 44, 8);
  ctx.stroke();

  ctx.font = 'bold 12px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('LOCKED MULTIPLIER', 36, y + 28);

  const multText = `${bet.lockedMultiplier.toFixed(1)}x`;
  ctx.font = 'bold 22px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#22C55E';
  ctx.textAlign = 'right';
  ctx.fillText(multText, W - 36, y + 32);
  ctx.textAlign = 'left';

  y += 60;

  // ── Footer ──
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(20, y, W - 40, 1);
  y += 15;

  ctx.font = '12px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.textAlign = 'center';
  ctx.fillText('Think you can beat this? Play F1™ Poolers!', W / 2, y + 10);
  ctx.font = 'bold 14px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#DC2626';
  ctx.fillText('adster.app', W / 2, y + 30);
  ctx.textAlign = 'left';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image'));
    }, 'image/png');
  });
}

/**
 * Generate share text for the prediction
 */
export function generateShareText(
  bet: Bet,
  event: Event,
  round: Round,
  username: string
): string {
  let text = `🏎️ My F1 Prediction — ${round.name} ${event.type}\n\n`;

  if (bet.predictions && bet.predictions.length > 0) {
    text += `🏁 Drivers:\n`;
    bet.predictions.forEach((d, i) => {
      text += `  P${i + 1}: ${d.name}\n`;
    });
  }

  if (bet.teamPredictions && bet.teamPredictions.length > 0) {
    text += `\n🔧 Teams:\n`;
    bet.teamPredictions.forEach((t, i) => {
      text += `  P${i + 1}: ${t.name}\n`;
    });
  }

  text += `\n⏱️ Multiplier: ${bet.lockedMultiplier.toFixed(1)}x`;
  text += `\n\nThink you can beat @${username}? Play F1™ Poolers!\n🌐 adster.app`;

  return text;
}

/**
 * Share a bet slip using Web Share API or fallback to clipboard
 * Returns 'shared' | 'copied' | 'downloaded' 
 */
export async function shareBetSlip(
  bet: Bet,
  event: Event,
  round: Round,
  username: string
): Promise<'shared' | 'copied' | 'downloaded'> {
  const text = generateShareText(bet, event, round, username);

  try {
    const imageBlob = await generateBetSlipImage(bet, event, round, username);
    const imageFile = new File([imageBlob], 'f1-prediction.png', { type: 'image/png' });

    // Try Web Share API with image
    if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
      await navigator.share({
        text,
        files: [imageFile],
      });
      return 'shared';
    }

    // Try Web Share API with text only
    if (navigator.share) {
      await navigator.share({ text });
      return 'shared';
    }
  } catch (err: any) {
    // User cancelled share or share failed — fall through to clipboard
    if (err.name === 'AbortError') return 'shared'; // user cancelled, still counts
  }

  // Fallback: copy text to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    // Last resort: download image
    try {
      const blob = await generateBetSlipImage(bet, event, round, username);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'f1-prediction.png';
      a.click();
      URL.revokeObjectURL(url);
      return 'downloaded';
    } catch {
      throw new Error('Unable to share prediction');
    }
  }
}

/**
 * Download the bet slip image
 */
export async function downloadBetSlipImage(
  bet: Bet,
  event: Event,
  round: Round,
  username: string
): Promise<void> {
  const blob = await generateBetSlipImage(bet, event, round, username);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `f1-prediction-${round.name.toLowerCase().replace(/\s+/g, '-')}-${event.type.toLowerCase().replace(/\s+/g, '-')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Helper: rounded rectangle ──
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
