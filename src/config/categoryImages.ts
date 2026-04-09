/**
 * Category-Based AI Image System
 * 20 categories × 3 images = 60 unique fallback images
 * 
 * Images are high-quality Unsplash photos with commercial/premium feel
 * Middle Eastern/Iraqi vibe where applicable
 * Deterministic rotation based on post ID (NOT random)
 */

export const CATEGORY_IMAGES: Record<string, string[]> = {
  // 1. RESTAURANTS & DINING
  dining: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", // modern restaurant interior
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", // elegant dining table
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", // fine dining plates
  ],

  // 2. CAFES & COFFEE
  cafe: [
    "https://images.unsplash.com/photo-1501339819398-ed495197ff21?w=600&q=80", // cozy cafe interior
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80", // modern coffee shop
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", // coffee cups atmosphere
  ],

  // 3. HOTELS & STAYS
  hotels: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", // luxury hotel lobby
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", // hotel room interior
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80", // resort reception
  ],

  // 4. SHOPPING & RETAIL
  shopping: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80", // retail store
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80", // modern boutique
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a9?w=600&q=80", // clothing store
  ],

  // 5. BANKS & FINANCE
  banks: [
    "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=600&q=80", // modern bank interior
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", // corporate building
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80", // financial office
  ],

  // 6. EDUCATION
  education: [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80", // university campus
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80", // classroom
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80", // library study
  ],

  // 7. ENTERTAINMENT
  entertainment: [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80", // concert venue
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80", // nightlife lights
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80", // music stage
  ],

  // 8. TOURISM & TRAVEL
  tourism: [
    "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?w=600&q=80", // airplane travel
    "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&q=80", // historic landmark
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80", // adventure road
  ],

  // 9. DOCTORS & PHYSICIANS
  doctors: [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80", // doctor portrait
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80", // medical consultation
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80", // stethoscope
  ],

  // 10. LAWYERS & LEGAL
  lawyers: [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80", // legal office
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80", // business suit
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", // legal documents
  ],

  // 11. HOSPITALS & CLINICS
  hospitals: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80", // modern hospital
    "https://images.unsplash.com/photo-1587351021759-3e566b86af42?w=600&q=80", // hospital corridor
    "https://images.unsplash.com/photo-1516574187841-69301976e499?w=600&q=80", // medical facility
  ],

  // 12. MEDICAL CLINICS
  medical: [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80", // clinic reception
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80", // examination room
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80", // medical equipment
  ],

  // 13. REAL ESTATE
  realestate: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80", // property exterior
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80", // apartment interior
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", // luxury home
  ],

  // 14. EVENTS & VENUES
  events: [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80", // event venue
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80", // wedding hall
    "https://images.unsplash.com/photo-1530103862676-de3c9da59af5?w=600&q=80", // party venue
  ],

  // 15. PHARMACY & DRUGS
  pharmacy: [
    "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=600&q=80", // pharmacy shelf
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80", // medicine store
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80", // pharmacist
  ],

  // 16. GYM & FITNESS
  gym: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", // gym interior
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80", // weights equipment
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=80", // modern fitness
  ],

  // 17. BEAUTY & SALONS
  beauty: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80", // salon interior
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", // beauty treatment
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80", // hair salon
  ],

  // 18. SUPERMARKETS
  supermarkets: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80", // grocery store
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80", // supermarket aisle
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80", // fresh produce
  ],

  // 19. FURNITURE & HOME
  furniture: [
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80", // furniture showroom
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", // sofa display
    "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&q=80", // modern interior
  ],

  // 20. OTHERS & GENERAL
  general: [
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80", // generic business
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", // city building
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", // office interior
  ],
};

// Default category when none matches
export const DEFAULT_CATEGORY = "general";

/**
 * Get image for a post using deterministic rotation
 * @param category - Business category
 * @param postId - Post ID for deterministic selection
 * @returns Image URL
 */
export function getCategoryImage(category: string | null | undefined, postId: string): string {
  const normalizedCategory = (category || DEFAULT_CATEGORY).toLowerCase();
  
  // Get array for category, fallback to general
  const images = CATEGORY_IMAGES[normalizedCategory] || CATEGORY_IMAGES[DEFAULT_CATEGORY];
  
  // Deterministic rotation: hash postId to index
  // Simple hash: sum char codes, mod by array length
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = ((hash << 5) - hash) + postId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % images.length;
  
  return images[index];
}

/**
 * Infer category from Arabic/English caption text
 */
export function inferCategoryFromCaption(caption: string): string {
  const lower = caption.toLowerCase();
  
  // Restaurant keywords
  if (lower.includes("مطعم") || lower.includes("restaurant") || lower.includes("طعام") || 
      lower.includes("أكل") || lower.includes("food")) return "dining";
  
  // Cafe keywords
  if (lower.includes("كافي") || lower.includes("coffee") || lower.includes("قهوة") || 
      lower.includes("كافيه")) return "cafe";
  
  // Hotel keywords
  if (lower.includes("فندق") || lower.includes("hotel") || lower.includes("سكن") || 
      lower.includes("اقامة")) return "hotels";
  
  // Pharmacy keywords
  if (lower.includes("صيدلية") || lower.includes("pharmacy") || lower.includes("دواء") || 
      lower.includes("ادوية")) return "pharmacy";
  
  // Hospital keywords
  if (lower.includes("مستشفى") || lower.includes("hospital") || lower.includes("جراحة")) return "hospitals";
  
  // Doctor/Clinic keywords
  if (lower.includes("طبيب") || lower.includes("clinic") || lower.includes("دكتور") || 
      lower.includes("عيادة")) return "medical";
  
  // Beauty/Salon keywords
  if (lower.includes("صالون") || lower.includes("beauty") || lower.includes("حلاق") || 
      lower.includes("تجميل")) return "beauty";
  
  // Gym keywords
  if (lower.includes("جيم") || lower.includes("gym") || lower.includes("رياضة") || 
      lower.includes("fitness") || lower.includes("صالة رياضية")) return "gym";
  
  // Shopping keywords
  if (lower.includes("محل") || lower.includes("shop") || lower.includes("تسوق") || 
      lower.includes("store") || lower.includes("بوتيك")) return "shopping";
  
  // Supermarket keywords
  if (lower.includes("سوبر") || lower.includes("supermarket") || lower.includes("بقالة") || 
      lower.includes("هايبر")) return "supermarkets";
  
  // Real estate keywords
  if (lower.includes("عقار") || lower.includes("real estate") || lower.includes("بيت") || 
      lower.includes("شقة") || lower.includes("منزل")) return "realestate";
  
  // Event keywords
  if (lower.includes("حدث") || lower.includes("event") || lower.includes("مناسبة") || 
      lower.includes("قاعة") || lower.includes("party")) return "events";
  
  // Tourism keywords
  if (lower.includes("سفر") || lower.includes("tourism") || lower.includes("رحلة") || 
      lower.includes("travel") || lower.includes("سياحة")) return "tourism";
  
  // Bank keywords
  if (lower.includes("بنك") || lower.includes("bank") || lower.includes("مصرف") || 
      lower.includes("مالية")) return "banks";
  
  // Education keywords
  if (lower.includes("مدرسة") || lower.includes("school") || lower.includes("تعليم") || 
      lower.includes("university") || lower.includes("جامعة")) return "education";
  
  // Legal keywords
  if (lower.includes("قانون") || lower.includes("lawyer") || lower.includes("محامي") || 
      lower.includes("legal")) return "lawyers";
  
  // Furniture keywords
  if (lower.includes("أثاث") || lower.includes("furniture") || lower.includes("ديكور") || 
      lower.includes("家居")) return "furniture";
  
  return "general";
}

// Known generic/filler image URLs that should be treated as placeholders
const GENERIC_IMAGE_PATTERNS = [
  "photo-1517248135467-4c7edcad34c4", // The old default restaurant image
  "placeholder",
  "default",
  "dummy",
  "example",
];

/**
 * Check if an image URL is a known generic/filler that should use category fallback
 */
function isGenericImage(url: string): boolean {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return GENERIC_IMAGE_PATTERNS.some(pattern => lowerUrl.includes(pattern));
}

/**
 * Get fallback image for a post
 * Priority: 1) Post image (if not generic), 2) Business category, 3) Caption inference
 * 
 * CRITICAL: Treats known generic URLs as placeholders to enable category-based rotation
 * This prevents "all posts look identical" when DB has same filler image for all rows
 */
export function getPostImage(
  post: { 
    id: string; 
    image_url: string | null; 
    caption: string | null; 
    caption_ar: string | null;
  },
  businessCategory?: string | null
): string {
  // 1. Use post image ONLY if it's not a known generic/filler
  if (post.image_url && !isGenericImage(post.image_url)) {
    return post.image_url;
  }
  
  // 2. Use business category if available
  if (businessCategory) {
    return getCategoryImage(businessCategory, post.id);
  }
  
  // 3. Infer from caption
  const caption = post.caption_ar || post.caption || "";
  const inferredCategory = inferCategoryFromCaption(caption);
  return getCategoryImage(inferredCategory, post.id);
}

/**
 * Dev-only diagnostic: Log image selection for debugging
 */
export function logImageSelection(
  postId: string,
  rawImageUrl: string | null,
  finalImageUrl: string,
  categoryUsed: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[ShakuMaku] Image selection:', {
      postId: postId.slice(0, 8) + '...',
      rawImageUrl: rawImageUrl?.slice(0, 50) + '...' || 'null',
      finalImageUrl: finalImageUrl.slice(0, 50) + '...',
      categoryUsed,
      usedFallback: isGenericImage(rawImageUrl || '')
    });
  }
}
