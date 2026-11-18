/**
 * Measurement IDs. Not secrets: both end up in the public HTML.
 *
 * The Google Tag Manager container holds every tag (Google tag AW-10782699656,
 * conversion linker and the Google Ads conversions "Clic en WhatsApp" and
 * "Clic en llamar"), triggered by clicks on wa.me and tel: links. Contact links
 * need no extra markup: any <a href="tel:…"> or <a href="https://wa.me/…"> counts.
 */
export const tracking = {
  gtmId: 'GTM-M9RFPH2T',
} as const;
