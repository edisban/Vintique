import { Suspense } from "react";
import OrdersClient from "./OrdersClient";

export default function OrdersPage() {
  // OrdersClient reads ?placed=1 via useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense>
      <OrdersClient />
    </Suspense>
  );
}
