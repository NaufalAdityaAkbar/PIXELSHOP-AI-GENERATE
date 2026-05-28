/**
 * Theme utility function ensuring specific, layered background gradients
 * for each landing page section while maintaining the consistent Ember Gold tone.
 */
export function applySectionGradients(section: 'hero' | 'features' | 'howItWorks' | 'testimonials'): string {
  switch (section) {
    case 'hero':
      // Golden Sunrise Coast: Deep obsidian moving into rich copper warmth, evoking dawn
      return 'bg-gradient-to-b from-[#060403] via-[#1e130d] to-[#0d0907]';
    case 'features':
      // Tech Cosmic Slate: Cooler charcoal basalt night with ultra-subtle starry purple-gold undertones
      return 'bg-gradient-to-tr from-[#0b0a09] via-[#090c0f] to-[#161218]';
    case 'howItWorks':
      // Sunset Cider Mahogany: Deep rich fluid clay-bronze, evoking warm sand and amber currents
      return 'bg-gradient-to-b from-[#0a0807] via-[#2a1a11] to-[#120d0a]';
    case 'testimonials':
      // Cozy Ember Hearth: High-contrast deeply saturated volcanic soot with shimmering amber stardust
      return 'bg-gradient-to-tl from-[#080605] via-[#1a110a] to-[#0a0807]';
    default:
      return 'bg-[#0e0a08]';
  }
}
