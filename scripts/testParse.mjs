import fs from 'node:fs';
import path from 'node:path';

// 1. Parse mSs Raw
const mssText = fs.readFileSync('scripts/mss_raw.txt', 'utf8');
const mssLines = mssText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const mssRegions = [
  'Andhra', 'Chennai', 'Coimbatore', 'Erode', 'Karnataka', 'Kerala',
  'Krishnagiri', 'Madurai', 'Mettur', 'Pondicherry', 'Salem', 'Sivakasi',
  'Telangana', 'Tirunelveli', 'Tirupur', 'Trichy', 'Vellore', 'Viluppuram'
];

const mssBranches = [];
let currentRegion = 'Tamil Nadu';
let i = 0;

while (i < mssLines.length) {
  const line = mssLines[i];
  if (mssRegions.includes(line)) {
    currentRegion = line;
    i++;
    continue;
  }

  // Branch Name
  const branchName = line;
  i++;
  // Details line(s) until next branch or region
  let details = '';
  if (i < mssLines.length && !mssRegions.includes(mssLines[i])) {
    details = mssLines[i];
    i++;
  }

  // Parse phone, digipin, address
  let phone = '';
  let digiPin = '';
  let address = details;

  const phoneMatch = details.match(/Phone:\s*([0-9,\s\-]+)/i);
  if (phoneMatch) {
    phone = phoneMatch[1].trim();
  }

  const digiMatch = details.match(/DIGI-PIN:\s*\[?([A-Z0-9\-]+)\]?/i);
  if (digiMatch) {
    digiPin = digiMatch[1].trim();
  }

  // Clean address
  address = address
    .replace(/Phone:.*$/i, '')
    .replace(/DIGI-PIN:.*$/i, '')
    .trim();

  // Determine state
  let state = 'Tamil Nadu';
  if (currentRegion === 'Andhra') state = 'Andhra Pradesh';
  else if (currentRegion === 'Karnataka') state = 'Karnataka';
  else if (currentRegion === 'Kerala') state = 'Kerala';
  else if (currentRegion === 'Telangana') state = 'Telangana';
  else if (currentRegion === 'Pondicherry') state = 'Puducherry';

  mssBranches.push({
    id: `mss-${mssBranches.length + 1}`,
    service: 'mSs Parcel Service',
    region: currentRegion,
    state,
    city: branchName.replace(/\s*\([^)]*\)/g, '').trim(),
    branchName,
    address: address || branchName,
    phone: phone || '7810990099',
    digiPin: digiPin || undefined
  });
}

console.log('Parsed mSs branches:', mssBranches.length);
console.log('Sample mSs branch:', mssBranches[0]);

// 2. Parse A1 HTML
const a1Html = fs.readFileSync('C:/Users/SAAQIB/.gemini/antigravity/brain/3e2fdf1b-44f8-459a-a44e-291f47a40ab5/.system_generated/steps/1275/content.md', 'utf8');

// Match each state tab
const stateTabRegex = /<div id="StateGrp_(\d+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div id="StateGrp_|\s*<\/div>\s*<\/div>\s*<\/div>)/gi;
const stateNames = {
  '1': 'Tamil Nadu',
  '2': 'Kerala',
  '3': 'Karnataka',
  '4': 'Puducherry',
  '5': 'Andhra Pradesh',
  '6': 'Gujarat',
  '7': 'Maharashtra'
};

const a1Branches = [];
const branchItemRegex = /<div class="col align-self-center branch-item"[^>]*data-name="([^"]*)"[^>]*data-place="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;

let match;
while ((match = branchItemRegex.exec(a1Html)) !== null) {
  const rawName = match[1].trim();
  const rawPlace = match[2].trim();
  const cardHtml = match[3];

  const contactMatch = cardHtml.match(/<span class="name[^"]*">.*?<\/i>\s*([^<]+)/i);
  const phoneMatch = cardHtml.match(/<span class="num[^"]*">.*?<b>([^<]+)<\/b>/i);
  const addressMatch = cardHtml.match(/<span class="addrs">([\s\S]*?)<\/span>/i);

  let address = '';
  if (addressMatch) {
    address = addressMatch[1]
      .replace(/<i[^>]*>.*?<\/i>/gi, '')
      .replace(/<br\s*\/?>/gi, ', ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/,\s*,/g, ',')
      .replace(/^,\s*/, '')
      .replace(/,\s*$/, '');
  }

  // Find which state this belongs to based on match index in a1Html
  const index = match.index;
  let state = 'Tamil Nadu';
  const state1Idx = a1Html.indexOf('id="StateGrp_1"');
  const state2Idx = a1Html.indexOf('id="StateGrp_2"');
  const state6Idx = a1Html.indexOf('id="StateGrp_6"');
  const state5Idx = a1Html.indexOf('id="StateGrp_5"');
  const state3Idx = a1Html.indexOf('id="StateGrp_3"');
  const state4Idx = a1Html.indexOf('id="StateGrp_4"');
  const state7Idx = a1Html.indexOf('id="StateGrp_7"');

  if (index >= state7Idx && state7Idx !== -1) state = 'Maharashtra';
  else if (index >= state4Idx && state4Idx !== -1) state = 'Puducherry';
  else if (index >= state3Idx && state3Idx !== -1) state = 'Karnataka';
  else if (index >= state5Idx && state5Idx !== -1) state = 'Andhra Pradesh';
  else if (index >= state6Idx && state6Idx !== -1) state = 'Gujarat';
  else if (index >= state2Idx && state2Idx !== -1) state = 'Kerala';
  else state = 'Tamil Nadu';

  a1Branches.push({
    id: `a1-${a1Branches.length + 1}`,
    service: 'A1 Travels & Speed Parcel Service',
    region: rawPlace || state,
    state,
    city: rawPlace,
    branchName: rawName || rawPlace,
    address: address || `${rawName}, ${rawPlace}`,
    phone: phoneMatch ? phoneMatch[1].trim() : '9790002552',
    contactPerson: contactMatch ? contactMatch[1].trim() : undefined
  });
}

console.log('Parsed A1 branches:', a1Branches.length);
console.log('Sample A1 branch:', a1Branches[0]);
