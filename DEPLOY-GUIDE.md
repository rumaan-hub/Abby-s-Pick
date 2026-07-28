# DealsCorner ko HostBreak (cPanel) par subdomain par live karna

Yeh guide aapko qadam-ba-qadam bataye gi ke `dealscorner-cpanel.zip` ko apni
HostBreak hosting par ek subdomain (masalan `deals.aapkadomain.com`) par kaise
live karna hai. App live deals **seedha aapke WooCommerce store** se laata hai.

> **Aham baat:** Yeh app ek Node.js server chalata hai — isliye HostBreak ka
> **Standard Plan (ya us se upar)** chahiye, kyunke Node.js sirf usi par milta
> hai. Agar aap ka plan Entry/Basic hai to pehle upgrade karna paray ga (ya
> HostBreak support se pooch lein ke Node.js available hai ya nahi).

---

## Aap ko kya kya chahiye (pehle se taiyaar rakhein)

1. **`dealscorner-cpanel.zip`** — jo maine aap ko bheji hai.
2. **cPanel login** — HostBreak ka username/password (ya HostBreak client area
   se "Login to cPanel").
3. **WooCommerce ki 3 cheezein:**
   - Store ka URL — masalan `https://abbystopshop.com`
   - Consumer Key — `ck_` se shuru hoti hai
   - Consumer Secret — `cs_` se shuru hoti hai
   - (Agar aap ke paas ck/cs nahi to niche "WooCommerce keys kaise banayein"
     dekhein.)
4. **Deals category** — aap ke store mein jis category ke products is page par
   dikhane hain, us ka slug ya ID (masalan `exclusive-deals`). Yeh optional hai;
   na dein to saare latest products aa jayenge.

---

## Step 1 — Subdomain banayein

1. cPanel mein login karein.
2. **Domains** section mein **"Domains"** (ya purane cPanel mein **"Subdomains"**)
   par click karein.
3. **Create a New Domain / Subdomain** par jayein.
4. Subdomain likhein: masalan `deals` — aur apna domain choose karein. Poora
   address banega: `deals.aapkadomain.com`.
5. **Document Root** khud ban jaye ga (masalan `/home/USERNAME/deals.aapkadomain.com`).
   Is path ko **note kar lein** — agle step mein kaam aaye ga.
6. Create par click karein.

> SSL (https): HostBreak aam taur par free AutoSSL deta hai. Subdomain banane ke
> baad thodi der mein SSL khud lag jaata hai. Agar na lage to cPanel → **SSL/TLS
> Status** → apni subdomain select karke **"Run AutoSSL"** chala dein.

---

## Step 2 — Files upload karein

1. cPanel → **Files** → **File Manager** kholein.
2. Us folder mein jayein jo Step 1 mein bana tha
   (masalan `deals.aapkadomain.com`). **Zaroori:** is folder ke andar jo default
   files hon (jaise `index.html`, `cgi-bin`) unhein delete kar dein taake folder
   khaali ho.
3. Upar **Upload** par click karein aur `dealscorner-cpanel.zip` upload karein.
4. Upload ke baad File Manager mein wapas jayein, zip par **right-click →
   Extract** karein. Extract usi folder mein karein.
5. Extract hone ke baad folder mein yeh cheezein honi chahiyein:
   - `.output/` (folder)
   - `app.mjs`
   - `package.json`

   > Agar `.output` nazar na aaye to File Manager ke upar **Settings** mein jaa
   > kar **"Show Hidden Files (dotfiles)"** ka option on kar lein — kyunke
   > `.output` ek hidden folder hai (dot se shuru).
6. Zip file (`dealscorner-cpanel.zip`) ko ab delete kar sakte hain — zaroorat
   nahi rahi.

---

## Step 3 — Node.js App set up karein

1. cPanel → **Software** section → **"Setup Node.js App"** par click karein.
2. **"Create Application"** par click karein.
3. Fields is tarah bharein:

   | Field | Kya daalna hai |
   |---|---|
   | **Node.js version** | Sab se nayi available version chunein (18, 20, ya 22 — jitni nayi ho utni behtar). |
   | **Application mode** | **Production** |
   | **Application root** | Wohi folder path jahan aap ne files extract kii — masalan `deals.aapkadomain.com` (cPanel aksar `/home/USERNAME/` khud laga leta hai, aap sirf folder ka naam likhein). |
   | **Application URL** | Apni subdomain chunein: `deals.aapkadomain.com` |
   | **Application startup file** | `app.mjs` |

4. **Create** par click karein. cPanel app bana dega aur ek virtual
   environment set kar dega.

---

## Step 4 — Environment Variables (API keys) daalein

Yeh sab se zaroori hissa hai — inhi se deals aati hain.

1. Usi "Setup Node.js App" page par, apni nayi app ke neeche
   **"Environment variables"** section dhoondhein.
2. **"Add Variable"** par click karke ek-ek karke yeh daalein (naam bilkul aise
   hi, capital letters mein):

   | Variable name | Value (misaal) |
   |---|---|
   | `WOOCOMMERCE_STORE_URL` | `https://abbystopshop.com` |
   | `WOOCOMMERCE_CONSUMER_KEY` | `ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
   | `WOOCOMMERCE_CONSUMER_SECRET` | `cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
   | `WOOCOMMERCE_DEALS_CATEGORY` | `exclusive-deals` *(optional — category ka slug ya numeric id)* |

   - `WOOCOMMERCE_STORE_URL` mein aakhir mein slash `/` mat lagayein.
   - `WOOCOMMERCE_DEALS_CATEGORY` optional hai. Chhod dein to store ke saare
     latest published products aa jayenge. Agar sirf khaas category dikhani hai
     to us ka slug (jaise `exclusive-deals`) ya us ki numeric ID daalein.

3. Har variable add karne ke baad **Save** zaroor karein.

---

## Step 5 — App chalayein

1. Usi page par upar **"Run NPM Install"** ki zaroorat **nahi** hai — is app
   mein sari cheezein pehle se bundle hain. (Agar aap ne chala bhi diya to koi
   nuqsan nahi.)
2. Upar **"Restart"** (ya "Start") button par click karein.
3. Ab apna browser kholein aur jayein: `https://deals.aapkadomain.com`
4. Deals page load ho jana chahiye, aur "Exclusive Deals" section mein aap ke
   WooCommerce products live nazar aane chahiyein.

Mubarak ho — page live ho gaya!

---

## Agar kuch theek se na chale (troubleshooting)

**"Couldn't load deals" ya "Missing WooCommerce settings" dikhe:**
Iska matlab env variables theek se set nahi hue. Step 4 dobara check karein —
naam bilkul theek honi chahiyein (capital letters), values sahi hon, aur Save +
Restart kiya ho.

**"WooCommerce request failed [401]" ya "[403]":**
Keys ghalat hain ya un ke paas products parhne ki permission nahi. WooCommerce
admin mein ja kar keys dobara check karein (niche tareeqa). Yaqeen karein ke key
ki permission **Read** (ya Read/Write) hai.

**"WooCommerce request failed [404]":**
Store URL ghalat hai, ya us par WooCommerce REST API on nahi. `WOOCOMMERCE_STORE_URL`
check karein (https ke saath, aakhir mein slash ke baghair).

**Page bilkul nahi khulta / 503 error:**
"Setup Node.js App" par ja kar app ko **Restart** karein. Agar phir bhi na chale,
usi page par error/log dikhta hai — HostBreak support ko woh screenshot bhej dein.

**`.output` folder nazar nahi aata File Manager mein:**
File Manager → Settings → "Show Hidden Files (dotfiles)" on karein.

---

## WooCommerce keys kaise banayein (agar na hon)

1. Apne WordPress admin mein login karein.
2. **WooCommerce → Settings → Advanced → REST API** par jayein.
3. **"Add key"** par click karein.
4. Description koi bhi likhein (jaise "Deals Page"), User apna admin chunein,
   aur **Permissions** ko **Read** rakhein.
5. **"Generate API key"** par click karein.
6. Ab aap ko **Consumer key (`ck_...`)** aur **Consumer secret (`cs_...`)** milenge.
   **Inhein abhi copy kar lein** — secret dobara nazar nahi aata. Yehi dono
   Step 4 mein daalne hain.

---

## Deals ki category kaise badlein

Aap ke store mein jo bhi products aap "Deals" page par dikhana chahte hain,
unhein WooCommerce admin mein ek khaas category (jaise "Exclusive Deals") mein
daal dein, aur us category ka slug `WOOCOMMERCE_DEALS_CATEGORY` mein set kar dein.
Jaise hi aap us category mein product add/remove karenge, yeh page khud update
ho jaye ga (5 minute ke andar — kyunke page 5 min tak result yaad rakhta hai).

---

## "Shop now" button kaise kaam karta hai

Har deal card par ek **"Shop now"** button hai. Jab koi customer us par click
karta hai, to woh product **WooCommerce cart mein add ho kar seedha checkout page**
par pohanch jaata hai — jahan woh us deal ki payment karke khareed sakta hai.

Yeh khud-ba-khud aapke store ke checkout se judta hai (link is tarah banta hai:
`https://aapkastore.com/checkout/?add-to-cart=PRODUCT_ID`). Iske liye koi alag
setting nahi chahiye — bas yeh yaqeeni banayein ke aapke WooCommerce mein:

- **Checkout page maujood ho** (WooCommerce install karte waqt khud ban jaata hai).
- **"Redirect to the cart page after successful addition" wala option BAND ho**
  (WooCommerce → Settings → Products → General). Warna customer cart par ruk
  sakta hai. Aam taur par yeh pehle se theek hota hai.

Agar aap chahein ke button checkout ke bajaye **cart page** par le jaye (taake
customer aur products bhi add kar sake), to mujhe bata dein — main choti si
tabdeeli karke naya package bana doon ga.

## Currency

Poora page ab **dollar (`$`)** mein hai — deal prices, referral rewards, free
shipping, sab kuch. Agar kabhi kisi aur currency mein karna ho to batayein.

## Aage kuch badalna ho to

- **Design / text / offers** badalna ho — to mujhe batayein, main source code
  mein tabdeeli karke naya package bana doon ga.
- Referral (`$5 refer & earn`) wala hissa abhi sirf dikhawe ke liye hai — agar
  aap asal referral system chahte hain to alag se batayein.
