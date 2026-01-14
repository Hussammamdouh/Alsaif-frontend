import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header Area
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Profile Info
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
  },
  nameContainer: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Subscription Premium Card
  subscriptionCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    width: '80%',
  },
  premiumBadge: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  subscriptionBenefits: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  subscriptionButton: {
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  subscriptionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },

  // Menu Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },

  // Logout Area
  footer: {
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    borderWidth: 1,
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    marginTop: 24,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.4,
  },

  bottomSpacer: {
    height: 120,
  },
});
