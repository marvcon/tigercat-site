
const current=(location.pathname.split('/').pop()||'index.html');
document.querySelectorAll('[data-page]').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active')});
const toggle=document.querySelector('[data-mobile-toggle]'); const menu=document.querySelector('[data-mobile-menu]'); if(toggle&&menu){toggle.addEventListener('click',()=>menu.classList.toggle('open'));}


function byId(id){return document.getElementById(id)}
function generateTigerContent(){
  const brand=(byId('brand-input')?.value||'My brand').trim();
  const niche=(byId('niche-input')?.value||'streetwear').trim();
  const offer=(byId('offer-input')?.value||'new product drop').trim();
  const vibe=(byId('vibe-input')?.value||'bold, premium, energetic').trim();
  const out=byId('content-output');
  if(!out) return;
  const text=`HOOK IDEAS
1. Stop scrolling — ${brand} just changed the game in ${niche}.
2. This ${offer} was built for people who want ${vibe}.
3. If you love ${niche}, this drop is your sign to move now.

TIKTOK SCRIPT
Scene 1: Show the strongest visual for ${brand}.
Voice/Text: “This is what premium ${niche} energy looks like.”
Scene 2: Highlight the ${offer}.
Voice/Text: “We made this for people who want ${vibe}, not basic.”
Scene 3: Add social proof or scarcity.
Voice/Text: “Limited access. Real demand. Built to stand out.”
CTA: “Tap now and shop ${brand} before it’s gone.”

INSTAGRAM CAPTION
${brand} is bringing ${vibe} to ${niche}. Our ${offer} is built to stand out, move fast, and convert attention into action. Tap in now.

EMAIL SUBJECT LINES
• ${brand}: your next favorite ${offer}
• Premium ${niche} starts here
• The ${brand} drop you don’t want to miss`;
  out.textContent=text;
}

function generateTigerNFT(){
  const theme=(byId('nft-theme')?.value||'luxury bengal').trim();
  const style=(byId('nft-style')?.value||'3D premium').trim();
  const utility=(byId('nft-utility')?.value||'holder perks').trim();
  const out=byId('nft-output');
  if(!out) return;
  const text=`COLLECTION CONCEPT
Theme: ${theme}
Style: ${style}
Utility Angle: ${utility}

TRAIT IDEAS
• Eyes: emerald glow, gold flare, cyber teal, molten ember
• Fur patterns: royal stripe, neon streak, obsidian flame, solar ring
• Accessories: cigar, visor shades, gold chain, crown, astronaut suit
• Backgrounds: vault gold, neon city, ember cave, cosmic chamber

RARITY BUCKETS
Common: clean face variations
Rare: bold eyes + premium background
Epic: accessories + glow overlays
Legendary: full 3D character with signature pose

PROMPT STARTER
“Create a ${style} tiger-cat NFT portrait with a ${theme} theme, ultra-detailed fur, high-contrast gold and ember lighting, premium collectible vibe, centered composition, and ${utility} branding.”

METADATA NAME IDEAS
• Boss Ember
• Vault Bengal
• Neon Claw
• Solar Tigercat
• Genesis Flame`;
  out.textContent=text;
}
