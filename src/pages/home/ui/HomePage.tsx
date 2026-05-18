import { HeroSection } from '@/widgets/hero-section'
import { PartnerShowcase } from '@/widgets/partner-showcase'
import { PortfolioGallery } from '@/widgets/portfolio-gallery'
import { ProcessTimeline } from '@/widgets/process-timeline'
import { ProjectBoard } from '@/widgets/project-board'
import { ReviewList } from '@/widgets/review-list'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

export function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProjectBoard />
        <PartnerShowcase />
        <PortfolioGallery />
        <ReviewList />
        <ProcessTimeline />
      </main>
      <SiteFooter />
    </div>
  )
}
