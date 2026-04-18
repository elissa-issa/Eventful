const svgToDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

export const VENDOR_CARDS = [
  {
    id: 'paindor',
    imageAlt: 'PaindOr logo',
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="white"/>
        <path d="M24 18h184l-11 48H13z" fill="#ffd54a"/>
        <path d="M31 23h171l-8 34H23z" fill="#e42a2b"/>
        <text x="116" y="50" text-anchor="middle" font-family="Arial" font-weight="800" font-style="italic" font-size="30" fill="white">PaindOr</text>
        <rect x="40" y="61" width="86" height="6" rx="3" fill="#ffb300"/>
        <rect x="40" y="71" width="58" height="6" rx="3" fill="#ffb300"/>
      </svg>
    `),
  },
  {
    id: 'phoenicia',
    imageAlt: 'Phoenicia Luxury Hotel logo',
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="white"/>
        <circle cx="48" cy="48" r="26" fill="none" stroke="#0aa3a9" stroke-width="4"/>
        <path d="M28 57c9-8 29-8 38 0M31 64c8-5 23-5 31 0" stroke="#0aa3a9" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M48 26l8 18H40z" fill="#0aa3a9"/>
        <text x="82" y="36" font-family="Arial" font-size="9" font-weight="700" letter-spacing="4" fill="#d5a334">****</text>
        <text x="82" y="52" font-family="Arial" font-size="21" font-weight="800" letter-spacing="1.6" fill="#0aa3a9">PHOENICIA</text>
        <text x="82" y="71" font-family="Arial" font-size="16" font-weight="700" letter-spacing="1.4" fill="#0aa3a9">LUXURY HOTEL</text>
      </svg>
    `),
  },
  {
    id: 'caracalla',
    imageAlt: 'Caracalla Dance Theatre logo',
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="white"/>
        <text x="98" y="55" text-anchor="middle" font-family="Georgia" font-size="28" font-weight="700" font-style="italic" fill="#304d87">Caracalla</text>
        <path d="M145 40c9-8 18 4 10 12 14 3 16 16 4 20M181 28c4 9 5 24-4 34m-13-14h42" stroke="#304d87" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M173 19c3 2 5 5 6 9" stroke="#304d87" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="160" y="72" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.6" fill="#304d87">DANCE THEATRE</text>
      </svg>
    `),
  },
  {
    id: 'lesoiree',
    imageAlt: "L'soiree logo",
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="#fbf9f4"/>
        <text x="130" y="55" text-anchor="middle" font-family="Georgia" font-size="30" font-style="italic" fill="#6d695f">L'soiree</text>
        <circle cx="208" cy="42" r="2.5" fill="#6d695f"/>
        <path d="M214 33c5 5 5 14 0 19" stroke="#6d695f" stroke-width="2" fill="none"/>
      </svg>
    `),
  },
    {
    id: 'paindor',
    imageAlt: 'PaindOr logo',
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="white"/>
        <path d="M24 18h184l-11 48H13z" fill="#ffd54a"/>
        <path d="M31 23h171l-8 34H23z" fill="#e42a2b"/>
        <text x="116" y="50" text-anchor="middle" font-family="Arial" font-weight="800" font-style="italic" font-size="30" fill="white">PaindOr</text>
        <rect x="40" y="61" width="86" height="6" rx="3" fill="#ffb300"/>
        <rect x="40" y="71" width="58" height="6" rx="3" fill="#ffb300"/>
      </svg>
    `),
  },
  {
    id: 'phoenicia',
    imageAlt: 'Phoenicia Luxury Hotel logo',
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="white"/>
        <circle cx="48" cy="48" r="26" fill="none" stroke="#0aa3a9" stroke-width="4"/>
        <path d="M28 57c9-8 29-8 38 0M31 64c8-5 23-5 31 0" stroke="#0aa3a9" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M48 26l8 18H40z" fill="#0aa3a9"/>
        <text x="82" y="36" font-family="Arial" font-size="9" font-weight="700" letter-spacing="4" fill="#d5a334">****</text>
        <text x="82" y="52" font-family="Arial" font-size="21" font-weight="800" letter-spacing="1.6" fill="#0aa3a9">PHOENICIA</text>
        <text x="82" y="71" font-family="Arial" font-size="16" font-weight="700" letter-spacing="1.4" fill="#0aa3a9">LUXURY HOTEL</text>
      </svg>
    `),
  },
  {
    id: 'caracalla',
    imageAlt: 'Caracalla Dance Theatre logo',
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="white"/>
        <text x="98" y="55" text-anchor="middle" font-family="Georgia" font-size="28" font-weight="700" font-style="italic" fill="#304d87">Caracalla</text>
        <path d="M145 40c9-8 18 4 10 12 14 3 16 16 4 20M181 28c4 9 5 24-4 34m-13-14h42" stroke="#304d87" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M173 19c3 2 5 5 6 9" stroke="#304d87" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="160" y="72" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.6" fill="#304d87">DANCE THEATRE</text>
      </svg>
    `),
  },
  {
    id: 'lesoiree',
    imageAlt: "L'soiree logo",
    imageSrc: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="96" viewBox="0 0 260 96">
        <rect width="260" height="96" rx="18" fill="#fbf9f4"/>
        <text x="130" y="55" text-anchor="middle" font-family="Georgia" font-size="30" font-style="italic" fill="#6d695f">L'soiree</text>
        <circle cx="208" cy="42" r="2.5" fill="#6d695f"/>
        <path d="M214 33c5 5 5 14 0 19" stroke="#6d695f" stroke-width="2" fill="none"/>
      </svg>
    `),
  },
]
