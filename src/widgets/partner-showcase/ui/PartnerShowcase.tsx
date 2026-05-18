import { companyPartners, freelancePartners, PartnerCard } from '@/entities/partner'
import { SectionHead } from '@/shared/ui'

function PartnerGroup({
  title, href, partners,
}: { title: string; href: string; partners: typeof companyPartners }) {
  return (
    <div className="mx-auto max-w-330 px-5">
      <SectionHead title={title} moreHref={href} />
      <div className="scroll-row gap-0">
        {partners.map((p) => <PartnerCard key={p.id} partner={p} />)}
      </div>
    </div>
  )
}

export function PartnerShowcase() {
  return (
    <div className="bg-soft py-22.5 flex flex-col gap-15">
      <PartnerGroup title="개발/디자인 업체" href="/m7/s71"  partners={companyPartners} />
      <PartnerGroup title="프리랜서"         href="/m7/s71"  partners={freelancePartners} />
    </div>
  )
}
