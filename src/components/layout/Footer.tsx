import Link from "next/link";
import { MoitBadge } from "@/components/ui/MoitBadge";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, TiktokIcon } from "@/components/ui/icons";
import { footerGroups, policyGroup, siteConfig, socialLinks, type LinkGroup } from "@/config/site";

const socialIcons = {
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  instagram: InstagramIcon,
} as const;

function LinkColumn({ group }: { group: LinkGroup }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[22px] font-bold leading-[27px]">{group.title}</h3>
      {group.links.map((l) => (
        <Link key={l.href + l.label} href={l.href} className="text-lg font-light leading-[22px] transition-opacity hover:underline hover:opacity-70">
          {l.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * Footer theo Figma (1728px, nền đen).
 *
 * PLACEHOLDER còn lại:
 * - Link mạng xã hội = "#" (sửa trong config/site.ts).
 * - Huy hiệu Bộ Công Thương là SVG tạm (xem components/ui/MoitBadge.tsx).
 * - Mọi trang đích đều là trang placeholder (xem app/[...slug]).
 * - Chưa có form đăng ký nhận tin (nếu muốn thêm, làm ở bước sau).
 */
export function Footer() {
  const { contact, company, footerIntro } = siteConfig;
  const [group1, group2, group3, group4] = footerGroups;

  return (
    <footer className="flex w-full flex-col items-center bg-black pb-[50px] text-white">
      <div className="w-full max-w-[1728px]">
        {/* Top-footer */}
        <div className="flex min-h-[346px] flex-col xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col items-start gap-[25px] px-6 py-[50px] xl:px-[100px]">
            <div className="flex max-w-[1026px] flex-col gap-2.5">
              <h2 className="text-[clamp(20px,1.85vw,32px)] font-medium leading-tight">{footerIntro.title}</h2>
              <p className="text-lg font-light leading-[22px]">{footerIntro.text}</p>
            </div>

            <Link
              href={footerIntro.cta.href}
              className="inline-flex h-[47px] w-[399px] max-w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-[50px] border border-white p-2.5 text-lg font-medium transition-colors hover:bg-white hover:text-black sm:text-[22px]"
            >
              {footerIntro.cta.label}
              <span aria-hidden="true" className="relative block h-0 w-[30px] flex-none border-t-2 border-current">
                <span className="absolute -top-[6px] right-0 block size-2.5 origin-top-right rotate-45 border-r-2 border-t-2 border-current" />
              </span>
            </Link>

            <div className="flex gap-6 sm:gap-[45px]">
              {socialLinks.map(({ key, label, href }) => {
                const Icon = socialIcons[key];
                return (
                  <a key={key} href={href} aria-label={label} className="block size-[50px] text-white transition-opacity hover:opacity-75">
                    <Icon className="block size-full" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Liên hệ */}
          <div className="flex w-full flex-none flex-col items-start gap-10 px-6 pb-[50px] xl:w-[576px] xl:py-[50px] xl:pl-[50px] xl:pr-[100px]">
            <div className="flex w-full items-start gap-[25px]">
              <PhoneIcon className="size-14 flex-none text-white xl:size-20" />
              <div className="flex flex-col gap-[5px]">
                <span className="text-lg font-medium leading-[22px]">Hotline</span>
                <a href={contact.hotlineHref} className="whitespace-nowrap text-[clamp(20px,5vw,32px)] font-medium leading-10 xl:text-[32px]">
                  {contact.hotline}
                </a>
              </div>
            </div>
            <div className="flex w-full items-start gap-[25px]">
              <MailIcon className="h-11 w-14 flex-none text-white xl:h-16 xl:w-20" />
              <div className="flex flex-col gap-[5px]">
                <span className="text-lg font-medium leading-[22px]">Email</span>
                <a href={contact.emailHref} className="whitespace-nowrap text-[clamp(20px,5vw,32px)] font-medium leading-10 xl:text-[32px]">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Line */}
        <div className="mx-6 h-px bg-rule xl:mx-[100px]" />

        {/* Center-footer */}
        <div className="flex min-h-[310px] flex-col xl:flex-row xl:items-center">
          <div className="grid grid-cols-2 content-center gap-x-4 gap-y-5 px-6 py-5 xl:min-w-0 xl:max-w-[1172px] xl:flex-1 xl:grid-cols-[238px_238px] xl:gap-x-0 xl:px-[100px]">
            <LinkColumn group={group1} />
            <LinkColumn group={group2} />
            <LinkColumn group={group3} />
            <LinkColumn group={group4} />
          </div>
          <div className="px-6 py-5 xl:w-[316px] xl:flex-none xl:px-5">
            <LinkColumn group={policyGroup} />
          </div>
        </div>

        {/* Bottom-footer */}
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between">
          <div className="flex max-w-[1152px] flex-col gap-2.5 px-6 py-5 xl:px-[100px]">
            <strong className="text-lg font-extrabold leading-[22px]">© {company.name}</strong>
            <p className="text-lg font-light leading-[22px]">{company.legal}</p>
          </div>
          <div className="px-6 py-2.5 xl:w-[576px] xl:flex-none xl:px-5">
            <MoitBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}
