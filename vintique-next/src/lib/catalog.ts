export const CATEGORIES = ["Women", "Men", "Kids", "Shoes", "Bags", "Accessories", "Home", "Other"] as const;

export const CONDITIONS = ["New with tags", "New without tags", "Very good", "Good", "Satisfactory"] as const;

export const CONDITION_HINTS: Record<(typeof CONDITIONS)[number], string> = {
  "New with tags": "Never worn, original tags attached",
  "New without tags": "Never worn, tags removed",
  "Very good": "Lightly worn, no visible flaws",
  Good: "Worn, with minor signs of wear",
  Satisfactory: "Visible wear or small flaws, described in the listing",
};

// Flat shipping charged once per seller (each seller sends one parcel).
export const SHIPPING_PER_PARCEL = 3.9;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID: "Paid, waiting to ship",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
};

// Maximum lengths for listing fields, shared by the API and the sell form.
export const LIMITS = { title: 80, brand: 50, size: 20, description: 2000, maxPrice: 100000 } as const;
