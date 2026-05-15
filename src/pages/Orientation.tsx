import { Navigate } from "react-router-dom";

/**
 * /orientation is the new public entry point ("boussole multilingue").
 * It currently aliases the existing /onboarding flow which already collects
 * all the data needed for the 6-path orientation + 48h callback.
 *
 * When the simplified 10–14 question OrientationFlow is built, swap this
 * Navigate for the new flow component.
 */
const Orientation = () => <Navigate to="/onboarding" replace />;

export default Orientation;
