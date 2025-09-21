// Spacing utility classes and constants for consistent component spacing

export const SPACING = {
  // Component spacing
  navbar: {
    container: 'gap-4',
    logo: 'gap-3', 
    actions: 'gap-3',
    height: 'h-16'
  },
  
  header: {
    container: 'gap-4',
    navigation: 'gap-6',
    actions: 'gap-3',
    height: 'h-16'
  },
  
  footer: {
    sections: 'gap-8',
    contact: 'gap-3',
    social: 'gap-4'
  },
  
  // Common spacing
  xs: 'gap-1',
  sm: 'gap-2', 
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
  xxl: 'gap-8'
} as const

export const LAYOUT_SPACING = {
  // Container spacing
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  
  // Section spacing
  section: 'py-12 lg:py-16',
  sectionSm: 'py-8 lg:py-12',
  
  // Grid spacing
  grid: 'gap-6 lg:gap-8',
  gridSm: 'gap-4 lg:gap-6',
  
  // Component spacing within sections
  componentVertical: 'space-y-6',
  componentHorizontal: 'space-x-4',
  
  // Navigation spacing
  navItems: 'gap-6 lg:gap-8',
  navActions: 'gap-3'
} as const

// Helper function to combine spacing classes
export const spacing = {
  horizontal: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => `gap-x-${SPACING[size].replace('gap-', '')}`,
  vertical: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => `gap-y-${SPACING[size].replace('gap-', '')}`,
  all: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => SPACING[size],
  
  // Responsive spacing
  responsive: {
    sm: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => `gap-2 sm:${SPACING[size]}`,
    md: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => `gap-3 md:${SPACING[size]}`,
    lg: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => `gap-4 lg:${SPACING[size]}`
  }
}

// Component-specific spacing presets
export const componentSpacing = {
  navbar: `flex items-center ${SPACING.navbar.container}`,
  navbarLogo: `flex items-center ${SPACING.navbar.logo}`,
  navbarActions: `flex items-center ${SPACING.navbar.actions}`,
  
  headerNav: `hidden md:flex items-center ${SPACING.header.navigation}`,
  headerActions: `flex items-center ${SPACING.header.actions}`,
  
  footerSections: `grid grid-cols-1 md:grid-cols-4 ${SPACING.footer.sections}`,
  footerContact: `space-y-3`,
  footerSocial: `flex ${SPACING.footer.social}`,
  
  // Button groups
  buttonGroup: `flex items-center ${SPACING.md}`,
  buttonGroupSm: `flex items-center ${SPACING.sm}`,
  
  // Form spacing
  formField: 'space-y-2',
  formGroup: 'space-y-4',
  formActions: `flex items-center justify-end ${SPACING.md}`,
  
  // Card spacing
  cardContent: 'space-y-4',
  cardActions: `flex items-center justify-between ${SPACING.md}`,
  
  // List spacing
  listVertical: 'space-y-2',
  listHorizontal: `flex items-center ${SPACING.md}`
}