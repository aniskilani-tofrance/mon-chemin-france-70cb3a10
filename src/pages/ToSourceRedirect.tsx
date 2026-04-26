import { Navigate, useParams } from "react-router-dom";
import { resolveLeadSource } from "@/lib/leadSources";

export default function ToSourceRedirect() {
  const { sourceSlug } = useParams();
  const source = resolveLeadSource(sourceSlug);
  return <Navigate to={`/onboarding?source=${encodeURIComponent(source.slug)}`} replace />;
}
