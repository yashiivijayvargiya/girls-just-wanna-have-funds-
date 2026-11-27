// What each kind of business is asked when adding a product.
// Each "question" becomes one step of the product interview.
export const UNITS = [
  { value: 'piece', label: 'piece' },
  { value: 'pair', label: 'pair' },
  { value: 'g', label: 'gram (g)' },
  { value: 'ml', label: 'millilitre (ml)' },
  { value: 'cm', label: 'centimetre (cm)' },
  { value: 'm', label: 'metre (m)' },
];

export const BUSINESS_TYPES = {
  jewelry: {
    label: 'Jewelry & accessories',
    blurb: 'Bracelets, earrings, charms, beaded pieces',
    asksBatch: false,
    defaultWaste: 0,
    questions: [
      { key: 'beads', title: 'Which beads did you use?', help: 'Pick each bead type and how many. Size matters, so choose the exact one (e.g. 6mm pink glass). Add one line per type.', categories: ['Beads'], packaging: false },
      { key: 'charms', title: 'Any charms or pendants?', help: 'Skip this step if there are none.', categories: ['Charms'], packaging: false },
      { key: 'findings', title: 'How many jump rings, clasps and other findings?', help: 'Clasps, jump rings, earring hooks, end caps.', categories: ['Findings'], packaging: false },
      { key: 'cord', title: 'What cord, wire or chain, and how much?', help: 'Enter the length in the unit shown next to the box (usually cm).', categories: ['Cord & wire'], packaging: false },
      { key: 'packaging', title: 'What packaging goes with it?', help: 'Pouch, box, card, sticker.', categories: ['Packaging'], packaging: true },
    ],
  },
  crochet: {
    label: 'Crochet & knitting',
    blurb: 'Amigurumi, bags, wearables, home items',
    asksBatch: false,
    defaultWaste: 5,
    questions: [
      { key: 'yarn', title: 'Which yarn did you use, and how much?', help: 'Add each colour or yarn as its own line, with the grams used.', categories: ['Yarn'], packaging: false },
      { key: 'fill', title: 'Stuffing, safety eyes or other fill?', help: 'Skip if not needed.', categories: ['Stuffing & eyes'], packaging: false },
      { key: 'notions', title: 'Buttons, ribbons, keyrings or other extras?', help: 'Anything else that goes into the piece itself.', categories: ['Notions'], packaging: false },
      { key: 'packaging', title: 'What packaging goes with it?', help: 'Bag, tag, box.', categories: ['Packaging'], packaging: true },
    ],
  },
  candles: {
    label: 'Candles & wax',
    blurb: 'Candles, melts, wax-based products',
    asksBatch: true,
    defaultWaste: 5,
    questions: [
      { key: 'wax', title: 'How much wax for the whole batch?', help: 'Quantities here are for the whole batch. You will say how many candles it makes later.', categories: ['Wax'], packaging: false },
      { key: 'fragrance', title: 'Fragrance oil and dye?', help: 'Grams or ml used in the whole batch.', categories: ['Fragrance & dye'], packaging: false },
      { key: 'containers', title: 'Jars or containers, and wicks?', help: 'Enter the total number used in the batch.', categories: ['Containers & wicks'], packaging: false },
      { key: 'packaging', title: 'Labels, boxes and other packaging?', help: 'Total for the whole batch.', categories: ['Packaging'], packaging: true },
    ],
  },
  other: {
    label: 'Something else',
    blurb: 'Any other handmade or small-batch business',
    asksBatch: true,
    defaultWaste: 0,
    questions: [
      { key: 'materials', title: 'What materials go into the product?', help: 'Add every material used, with the quantity. If you make several at once, enter the total for the batch.', categories: ['Materials'], packaging: false },
      { key: 'packaging', title: 'What packaging goes with it?', help: 'Skip if none.', categories: ['Packaging'], packaging: true },
    ],
  },
};

export function getTemplate(type) {
  return BUSINESS_TYPES[type] || null;
}

// Categories offered when adding a material, based on the business type.
export function categoriesFor(type) {
  const t = getTemplate(type);
  const cats = t ? t.questions.flatMap((q) => q.categories) : ['Materials', 'Packaging'];
  return [...new Set([...cats, 'Other'])];
}
