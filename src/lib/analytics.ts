export function trackPageview(profileId: string) {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;

  const payload = JSON.stringify({
    profileId,
    event: 'pageview',
  });

  navigator.sendBeacon('/api/track-view', payload);
}

export function trackClick(linkId: string, profileId: string) {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;

  const payload = JSON.stringify({
    linkId,
    profileId,
    event: 'click',
  });

  navigator.sendBeacon('/api/track-click', payload);
}
