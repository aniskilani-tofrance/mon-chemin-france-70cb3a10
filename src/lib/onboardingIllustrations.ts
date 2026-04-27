import goalLearn from "@/assets/onboarding/goal_learn_french.jpg";
import goalJob from "@/assets/onboarding/goal_find_job.jpg";
import goalTraining from "@/assets/onboarding/goal_job_training.jpg";
import goalHelp from "@/assets/onboarding/goal_need_help.jpg";
import goalRecognize from "@/assets/onboarding/goal_recognize_diploma.jpg";
import lvlAlpha from "@/assets/onboarding/level_alpha.jpg";
import lvlA1 from "@/assets/onboarding/level_a1.jpg";
import lvlA2 from "@/assets/onboarding/level_a2.jpg";
import lvlB1 from "@/assets/onboarding/level_b1.jpg";
import litYes from "@/assets/onboarding/literacy_yes.jpg";
import litPartial from "@/assets/onboarding/literacy_partial.jpg";
import litNo from "@/assets/onboarding/literacy_no.jpg";
import wrYes from "@/assets/onboarding/work_right_yes.jpg";
import wrNo from "@/assets/onboarding/work_right_no.jpg";
import wrUnknown from "@/assets/onboarding/work_right_unknown.jpg";
import secBtp from "@/assets/onboarding/sector_btp.jpg";
import secLog from "@/assets/onboarding/sector_logistique.jpg";
import secProp from "@/assets/onboarding/sector_proprete.jpg";
import secAide from "@/assets/onboarding/sector_aide_personne.jpg";
import secHotel from "@/assets/onboarding/sector_hotellerie.jpg";
import secCom from "@/assets/onboarding/sector_commerce.jpg";
import tensionTransport from "@/assets/onboarding/tension_transport.jpg";
import tensionSante from "@/assets/onboarding/tension_sante.jpg";
import tensionSecurite from "@/assets/onboarding/tension_securite.jpg";
import mobWalk from "@/assets/onboarding/mobility_walk.jpg";
import mobBike from "@/assets/onboarding/mobility_bike.jpg";
import mobCar from "@/assets/onboarding/mobility_car.jpg";
import mobTransit from "@/assets/onboarding/mobility_transit.jpg";
import barTransport from "@/assets/onboarding/barrier_transport.jpg";
import barChildcare from "@/assets/onboarding/barrier_childcare.jpg";
import barSchedule from "@/assets/onboarding/barrier_schedule.jpg";
import barHousing from "@/assets/onboarding/barrier_housing.jpg";
import barHealth from "@/assets/onboarding/barrier_health.jpg";
import barNone from "@/assets/onboarding/barrier_none.jpg";
import contactYes from "@/assets/onboarding/contact_yes.jpg";
import contactNo from "@/assets/onboarding/contact_no.jpg";

const ILLUSTRATIONS: Record<string, string> = {
  learn_french: goalLearn,
  find_job: goalJob,
  job_training: goalTraining,
  need_help: goalHelp,
  recognize_diploma: goalRecognize,
  validate_diploma: goalRecognize,
  alpha: lvlAlpha,
  a1: lvlA1,
  a2: lvlA2,
  b1: lvlB1,
  yes: contactYes,
  no: contactNo,
  partial: litPartial,
  unknown: wrUnknown,
  literacy_yes: litYes,
  literacy_no: litNo,
  work_right_yes: wrYes,
  work_right_no: wrNo,
  btp: secBtp,
  logistique: secLog,
  proprete: secProp,
  aide_personne: secAide,
  hotellerie: secHotel,
  commerce: secCom,
  transport: tensionTransport,
  sante: tensionSante,
  securite: tensionSecurite,
  walk: mobWalk,
  bike: mobBike,
  car: mobCar,
  transit: mobTransit,
  local: mobWalk,
  regional: mobTransit,
  national: mobCar,
  childcare: barChildcare,
  health: barHealth,
  housing: barHousing,
  admin: barHousing,
  schedule: barSchedule,
  none: barNone,
  this_week: contactYes,
  prefer_message: contactYes,
  soon: contactYes,
  later: contactNo,
};

const preloadedImages = new Set<string>();

const scheduleIdle = (callback: () => void) => {
  if (typeof window === "undefined") return;
  const requestIdle = window.requestIdleCallback || ((cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 120));
  requestIdle(callback, { timeout: 900 });
};

export function getOnboardingIllustration(choiceId: string, contextId?: string) {
  const scopedKey = contextId ? `${contextId}_${choiceId}` : choiceId;
  return ILLUSTRATIONS[scopedKey] || ILLUSTRATIONS[choiceId];
}

export function preloadOnboardingIllustrations(urls: Array<string | undefined>) {
  if (typeof window === "undefined") return;
  const uniqueUrls = urls.filter((url): url is string => !!url && !preloadedImages.has(url));
  if (!uniqueUrls.length) return;

  scheduleIdle(() => {
    uniqueUrls.forEach((url) => {
      if (preloadedImages.has(url)) return;
      preloadedImages.add(url);
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = url;
    });
  });
}