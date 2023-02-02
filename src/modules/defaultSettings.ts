import { getService, SERVICES } from "../utils/config";
import { clearPref, getPref, setPref } from "../utils/prefs";
import { setServiceSecret } from "../utils/translate";

export function setDefaultPrefSettings() {
  const isZhCN = Zotero.locale === "zh-CN";
  const servicesIds = SERVICES.map((service) => service.id);
  if (!servicesIds.includes((getPref("translateSource") as string) || "")) {
    // Google Translate is not accessible in China mainland
    setPref("translateSource", isZhCN ? "cnki" : "googleapi");
  }
  if (!servicesIds.includes((getPref("dictSource") as string) || "")) {
    setPref("dictSource", isZhCN ? "bingdict" : "freedictionaryapi");
  }

  if (!getPref("targetLanguage")) {
    setPref("targetLanguage", Zotero.locale);
  }

  const secrets = JSON.parse((getPref("secretObj") as string) || "{}");
  for (const serviceId of servicesIds) {
    if (typeof secrets[serviceId] === "undefined") {
      secrets[serviceId] = getService(serviceId).defaultSecret || "";
    }
  }
  setPref("secretObj", JSON.stringify(secrets));

  if (isZhCN && !getPref("disabledLanguages")) {
    setPref("disabledLanguages", "zh,中文,中文;");
  }

  // For NiuTrans login. niutransLog is deprecated.
  const niutransApiKey = getPref("niutransApikey") as string;
  if (niutransApiKey) {
    setServiceSecret("niutranspro", niutransApiKey);
    clearPref("niutransApikey");
  }
  if (getPref("translateSource") === "niutransLog") {
    setPref("translateSource", "niutranspro");
  }
}