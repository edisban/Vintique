const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
export const formatPrice = (n: number) => eur.format(n);

export const memberSince = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
