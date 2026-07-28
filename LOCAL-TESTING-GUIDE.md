# DealsCorner — Local Testing Guide (Roman English)

Yeh guide aap ko step-by-step batayegi ke apne **Windows computer par** is project
ko kaise chalana hai, changes karni hain, aur test karna hai — **cPanel par deploy
karne se PEHLE**. Neeche ke saare steps maine khud is code par chala kar verify
kiye hain, to yeh commands 100% is project ke liye sahi hain.

Aap ka project kis cheez par bana hai (taake pata rahe):
**React 19 + TanStack Start + Vite** (frontend + SSR server ek saath). Data aap ke
**WooCommerce store** se aata hai. Package manager **Bun** hai (`bun.lock` file isi
liye hai).

---

## Part 0 — Ek dafa ka setup (sirf pehli baar)

### 0.1 — Node.js install karein
1. Browser mein jayein: https://nodejs.org
2. **LTS** version (green button) download karein aur install karein (bas Next,
   Next, Finish).
3. Check karne ke liye **Command Prompt** (ya PowerShell) kholein aur likhein:
   ```
   node --version
   ```
   Agar version number (jaise `v22.x.x`) dikhe to Node theek install hua.

### 0.2 — Bun install karein (yeh project Bun use karta hai)
Command Prompt / PowerShell mein yeh command chalayein:
```
powershell -c "irm bun.sh/install.ps1 | iex"
```
Install ke baad **PowerShell band kar ke dobara kholein**, phir check karein:
```
bun --version
```
Agar number dikhe (jaise `1.3.x`) to Bun ready hai.

> **Note:** Agar aap Bun install nahi karna chahte, to `npm` se bhi kaam chal
> sakta hai — har jagah `bun` ki jagah `npm` likh lein (jaise `npm install`,
> `npm run dev`). Lekin project originally Bun par bana hai, isliye Bun behtar hai.

---

## Part 1 — Project kholein aur dependencies install karein

### 1.1 — Terminal ko project folder mein le jayein
Command Prompt / PowerShell kholein aur yeh likhein (aap ka folder path):
```
cd "D:\New folder\Projects\Deals"
```

> **Tip:** Sabse aasan tarika — project folder ko File Explorer mein kholein,
> address bar mein `cmd` likh kar Enter dabayein. Terminal seedha usi folder mein
> khul jayega.

### 1.2 — Dependencies install karein
```
bun install
```
Yeh ~466 packages download karega (ek-do minute lagega). Jab
`packages installed` dikhe to ho gaya. (Yeh `node_modules` folder banata hai —
usse haath mat lagayein.)

---

## Part 2 — WooCommerce keys daalein (deals dikhane ke liye)

App ki homepage load hote hi aap ke WooCommerce store se live deals mangwati hai.
Iske liye 3 cheezein chahiyein: store URL, consumer key, consumer secret.
Local par yeh ek **`.env`** file mein daali jaati hain.

### 2.1 — `.env` file banayein
Project folder ke andar (`D:\New folder\Projects\Deals`) ek nayi file banayein
jiska naam bilkul **`.env`** ho (aage-peeche kuch nahi, sirf `.env`).

Us file ke andar yeh likhein (apni asli values ke saath):
```
WOOCOMMERCE_STORE_URL=https://aapkastore.com
WOOCOMMERCE_CONSUMER_KEY=ck_yahan_apni_key_daalein
WOOCOMMERCE_CONSUMER_SECRET=cs_yahan_apni_secret_daalein
WOOCOMMERCE_DEALS_CATEGORY=exclusive-deals
```

Zaroori baatein:
- `WOOCOMMERCE_STORE_URL` ke aakhir mein slash `/` **mat** lagayein.
- `WOOCOMMERCE_DEALS_CATEGORY` **optional** hai. Na daalein to store ke saare
  latest products aa jayenge. Sirf khaas category chahiye to us ka slug (jaise
  `exclusive-deals`) ya numeric ID daalein.
- **`.env` file kabhi kisi ko na bhejein aur GitHub par push na karein** — is mein
  aap ki secret keys hoti hain. (Project mein `.gitignore` pehle se ise ignore
  karta hai, to fikar ki baat nahi.)

### 2.2 — WooCommerce keys kahan se milti hain? (agar na hon)
1. Apne WordPress admin mein login karein.
2. **WooCommerce → Settings → Advanced → REST API** par jayein.
3. **"Add key"** par click karein.
4. Description koi bhi (jaise "Deals Local Test"), User apna admin chunein,
   Permissions **Read** rakhein.
5. **"Generate API key"** dabayein.
6. Ab **Consumer key (`ck_...`)** aur **Consumer secret (`cs_...`)** milenge —
   **abhi copy kar lein** (secret dobara nazar nahi aati). Yehi dono `.env` mein
   daalni hain.

---

## Part 3 — App ko local par chalayein (dev mode)

### 3.1 — Dev server start karein
Terminal mein (project folder ke andar):
```
bun run dev
```

Thodi der baad aap ko yeh dikhega:
```
VITE v8.x  ready in ... ms
➜  Local:   http://localhost:8080/
```

### 3.2 — Browser mein kholein
Apna browser (Chrome/Edge) kholein aur jayein:
```
http://localhost:8080
```

Deals page khul jayega aur aap ke WooCommerce products "Exclusive Deals" section
mein live nazar aayenge. 🎉

> **Port yaad rakhein: 8080** (na 3000, na 5173). Yeh is project ka default port
> hai — maine verify kiya hai.

### 3.3 — Server band karna
Jab kaam khatam ho, terminal mein **`Ctrl + C`** dabayein. Server ruk jayega.

---

## Part 4 — Changes karein aur live dekh’ein

Yeh sab se maze ki cheez hai: **dev server chalte hue** jab aap koi file save
karte hain, browser **khud-ba-khud refresh** ho jaata hai (isse "hot reload"
kehte hain). Alag se kuch karne ki zaroorat nahi.

Kaam ka tarika:
1. `bun run dev` chalta rehne dein (terminal band na karein).
2. Kisi bhi **code editor** mein project kholein. Sabse behtar
   **VS Code** hai (https://code.visualstudio.com se free download).
3. File edit karein, **save (Ctrl+S)** karein.
4. Browser (`http://localhost:8080`) khud update ho jayega — change foran dikhega.

### Kaun si file mein kya hai (aam changes ke liye):

| Aap ko kya badalna hai | Kaun si file kholein |
|---|---|
| Homepage ka text, headings, offers, cards, design | `src/routes/index.tsx` |
| WooCommerce se data laane ka logic (kitne products, filter waghera) | `src/lib/deals.functions.ts` |
| Poore page ke rang, font, global CSS | `src/styles.css` |
| Header/footer, ya poore site ka layout (har page par) | `src/routes/__root.tsx` |
| Ready-made buttons, cards, dialog waghera (design system) | `src/components/ui/` folder |

> **Tip:** `src/routes/index.tsx` mein sab se upar comment likha hai
> "edit these to point at your WooCommerce products" — wahin se content-related
> tabdeeliyan shuru karein.

---

## Part 5 — Deploy se pehle final check (production build test karein)

Local par sab theek chalne ke baad, deploy karne se pehle **ek dafa production
build** bana kar test kar lena acchi aadat hai — taake yaqeen ho jaye ke live par
bhi theek chalega. (cPanel bhi yehi build chalata hai.)

> **Bohat zaroori baat:** Is project ka **default build Cloudflare** ke liye banta
> hai, jo cPanel par **nahi** chalega. cPanel ke liye humein **Node** wala build
> chahiye. Neeche sahi command di hai.

### Windows (PowerShell) mein:
```
$env:NITRO_PRESET="node-server"
bun run build
```

### Windows (Command Prompt / cmd) mein:
```
set NITRO_PRESET=node-server
bun run build
```

Build ban’ne ke baad ek **`.output`** folder banega. Usse test karne ke liye:
```
node .output/server/index.mjs
```
Phir browser mein `http://localhost:8080` kholein — agar deals page theek khule
to build production-ready hai. (Band karne ke liye `Ctrl + C`.)

Yeh `.output` folder wahi cheez hai jo cPanel par upload hoti hai — is ke liye
alag **DEPLOY guide** hai (`DEPLOY-GUIDE.md` ya main aap ko bana kar de sakta hoon).

---

## Common masle aur unke hal (Troubleshooting)

**`bun` ya `node` "not recognized" error deta hai:**
Install ke baad terminal band kar ke **naya** terminal kholein. Phir bhi na chale
to computer ek dafa restart karein (PATH update ho jaata hai).

**Page par "Missing WooCommerce settings" likha aata hai:**
`.env` file theek se nahi bani. Check karein: file ka naam bilkul `.env` ho,
project folder ke andar ho, aur teenon values (URL, key, secret) sahi likhi hon.
Phir dev server band kar ke (`Ctrl+C`) dobara `bun run dev` chalayein — `.env`
sirf start hote waqt parhi jaati hai.

**"WooCommerce request failed [401]" ya "[403]":**
Keys ghalat hain ya unki permission nahi. WooCommerce admin mein keys dobara
banayein aur permission **Read** rakhein.

**"WooCommerce request failed [404]":**
Store URL ghalat hai ya us par WooCommerce REST API on nahi.
`WOOCOMMERCE_STORE_URL` check karein (https ke saath, aakhir mein slash ke baghair).

**Port 8080 "already in use" kehta hai:**
Koi purana server abhi chal raha hai. Purana terminal dhoond kar `Ctrl+C` karein,
ya computer restart kar ke dobara try karein.

**Page khaali (blank) aata hai ya ajeeb error:**
Browser mein **F12** daba kar "Console" tab dekhein — wahan asli error likha hoga.
Woh error mujhe bata dein, main hal bata dunga.

---

## Aik nazar mein — sab commands (cheat sheet)

```
# 1. Project folder mein jayein
cd "D:\New folder\Projects\Deals"

# 2. Dependencies (sirf pehli baar, ya package.json badalne par)
bun install

# 3. .env file banayein (WooCommerce keys ke saath) — Part 2 dekhein

# 4. Dev server chalayein (rozana ka kaam)
bun run dev
#    -> http://localhost:8080  browser mein kholein

# 5. Band karna
Ctrl + C

# 6. Deploy se pehle production build test (cPanel = Node)
#    PowerShell:
$env:NITRO_PRESET="node-server"; bun run build
#    cmd:
set NITRO_PRESET=node-server && bun run build
node .output/server/index.mjs
```

---

Ho gaya! Ab aap local par aaram se test aur changes kar sakte hain. Jab deploy
karne ke liye tayyar hon, cPanel subdomain wali guide follow karein (agar chahiye
to bata dein, main woh bhi verified steps ke saath bana dunga).
