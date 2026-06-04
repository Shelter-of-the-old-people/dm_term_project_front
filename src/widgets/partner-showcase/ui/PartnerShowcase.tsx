import { companyPartners, freelancePartners, PartnerCard } from '@/entities/partner'
import { SectionHead } from '@/shared/ui'

function PartnerGroup({
  title,
  href,
  partners,
}: {
  title: string
  href: string
  partners: typeof companyPartners
}) {
  return (
    <div className="mx-auto max-w-330 px-5">
      <SectionHead title={title} moreHref={href} />
      <div className="scroll-row gap-0">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  )
}

export function PartnerShowcase() {
  return (
    <div id="partners" className="flex flex-col gap-15 bg-soft py-22.5">
      <PartnerGroup title="개발/디자인 업체" href="/#partners" partners={companyPartners} />
      <PartnerGroup title="프리랜서" href="/#partners" partners={freelancePartners} />
    </div>
  )
}
