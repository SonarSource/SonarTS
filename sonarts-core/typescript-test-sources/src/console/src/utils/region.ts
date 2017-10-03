const subscriptionRegions = {
  'EU_WEST_1': __SUBSCRIPTIONS_EU_WEST_1__,
  'US_WEST_2': __SUBSCRIPTIONS_US_WEST_2__,
  'AP_NORTHEAST_1': __SUBSCRIPTIONS_AP_NORTHEAST_1__,
}

export default function getSubscriptionEndpoint(region) {
  const endpoint = subscriptionRegions[region]

  return `${endpoint}`
}
