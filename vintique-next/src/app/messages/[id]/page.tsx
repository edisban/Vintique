import { Suspense } from "react";
import ThreadClient from "./ThreadClient";

export default function ThreadPage() {
  return (
    <Suspense>
      <ThreadClient />
    </Suspense>
  );
}
