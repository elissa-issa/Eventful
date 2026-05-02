export function isPremiumUser(user) {
  return Boolean(
    user?.plan === 'premium' ||
      user?.subscriptionPlan === 'premium' ||
      user?.isPremium,
  )
}
