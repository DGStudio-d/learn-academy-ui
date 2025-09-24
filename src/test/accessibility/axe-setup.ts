import { configureAxe } from 'jest-axe';

// Configure axe for accessibility testing
export const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for testing as it requires actual rendering
    'color-contrast': { enabled: false },
    // Configure other rules as needed
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'bypass': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
});

// Helper function to test accessibility of a component
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  return results;
};

// Helper to check for specific accessibility features
export const checkAccessibilityFeatures = (container: HTMLElement) => {
  const features = {
    hasSkipLink: !!container.querySelector('a[href="#main-content"], a[href="#dashboard-main-content"]'),
    hasMainLandmark: !!container.querySelector('main, [role="main"]'),
    hasNavLandmark: !!container.querySelector('nav, [role="navigation"]'),
    hasHeadings: !!container.querySelector('h1, h2, h3, h4, h5, h6'),
    hasAriaLabels: !!container.querySelector('[aria-label], [aria-labelledby]'),
    hasFocusableElements: !!container.querySelector('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'),
    hasAltText: Array.from(container.querySelectorAll('img')).every(img => 
      img.hasAttribute('alt') || img.hasAttribute('aria-label') || img.getAttribute('role') === 'presentation'
    ),
  };

  return features;
};

// Helper to simulate keyboard navigation
export const simulateKeyboardNavigation = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
  );

  const results = {
    totalFocusableElements: focusableElements.length,
    elementsWithVisibleFocus: 0,
    elementsWithAriaLabels: 0,
    elementsWithProperRoles: 0,
  };

  focusableElements.forEach((element) => {
    // Check for visible focus indicators
    const computedStyle = window.getComputedStyle(element as HTMLElement);
    if (computedStyle.outline !== 'none' || element.classList.contains('focus:outline')) {
      results.elementsWithVisibleFocus++;
    }

    // Check for ARIA labels
    if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
      results.elementsWithAriaLabels++;
    }

    // Check for proper roles
    if (element.hasAttribute('role') || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName)) {
      results.elementsWithProperRoles++;
    }
  });

  return results;
};

// Helper to check color contrast (basic implementation)
export const checkColorContrast = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const backgroundColor = style.backgroundColor;
  const color = style.color;
  
  // This is a simplified check - in real implementation you'd use a proper contrast ratio calculator
  return {
    backgroundColor,
    color,
    hasGoodContrast: backgroundColor !== color && backgroundColor !== 'transparent',
  };
};

// Helper to test screen reader content
export const checkScreenReaderContent = (container: HTMLElement) => {
  const srOnlyElements = container.querySelectorAll('.sr-only');
  const ariaLiveElements = container.querySelectorAll('[aria-live]');
  const ariaHiddenElements = container.querySelectorAll('[aria-hidden="true"]');

  return {
    screenReaderOnlyCount: srOnlyElements.length,
    liveRegionCount: ariaLiveElements.length,
    hiddenFromScreenReaderCount: ariaHiddenElements.length,
    hasProperScreenReaderSupport: srOnlyElements.length > 0 || ariaLiveElements.length > 0,
  };
};