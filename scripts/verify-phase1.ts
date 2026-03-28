import { TargetService } from '../src/lib/db/target-service';
import { SnapshotService } from '../src/lib/db/snapshot-service';
import { CaptureService } from '../src/lib/engine/capture-service';

async function verify() {
  console.log('--- Phase 1 Verification ---');

  // 1. Target Management
  const targetName = 'Google Test';
  const targetUrl = 'https://www.google.com';
  
  console.log(`Registering target: ${targetName} (${targetUrl})...`);
  const targetId = TargetService.create(targetName, targetUrl);
  console.log(`Target registered with ID: ${targetId}`);

  // 2. Capture Engine
  console.log('Capturing initial snapshot...');
  const result = await CaptureService.capture(targetUrl, Number(targetId));
  console.log('Capture successful:', result);

  // 3. Baseline Recording
  const isBaseline = !SnapshotService.hasBaseline(Number(targetId));
  console.log(`Saving snapshot (isBaseline: ${isBaseline})...`);
  const snapshotId = SnapshotService.create(Number(targetId), result.screenshotPath, result.htmlPath, isBaseline);
  console.log(`Snapshot saved with ID: ${snapshotId}`);

  // Final check
  const target = TargetService.getById(Number(targetId));
  const baseline = SnapshotService.getBaseline(Number(targetId));
  
  console.log('\n--- Result ---');
  console.log('Target:', target);
  console.log('Baseline:', baseline);
  
  if (target && baseline) {
    console.log('\nPhase 1 verification PASSED.');
  } else {
    console.log('\nPhase 1 verification FAILED.');
  }
}

verify().catch(console.error);
