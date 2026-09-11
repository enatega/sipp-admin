'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { type SidebarMenu } from '@/config/sidebar';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

type SubmenuItemProps = {
  item: SidebarMenu;
  isSubMenuActive: boolean;
  depth?: number;
};

function stripQuery(path: string) {
  const q = path.indexOf('?');
  return q === -1 ? path : path.slice(0, q);
}

const SubMenuItem = ({
  item,
  isSubMenuActive,
  depth = 0,
}: SubmenuItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const getLabel = (translationKey: string, fallback: string) =>
    t.has(translationKey) ? t(translationKey) : fallback;

  const [open, setOpen] = useState(isSubMenuActive);

  return (
    <Collapsible
      key={item.name}
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild className="!px-3 !py-2">
          <SidebarMenuButton
            tooltip={getLabel(item.translationKey, item.name)}
            onClick={() => {
              if (item.path && item.path !== '#') {
                router.push(item.path);
              }
            }}
            className={cn(
              'hover:!bg-gray-200/50 hover:text-primary',
              isSubMenuActive &&
                'bg-primary text-white hover:!bg-primary hover:!text-white',
            )}
          >
            {item.icon ? <item.icon className="!w-5 !h-5" aria-hidden /> : null}
            <span>{getLabel(item.translationKey, item.name)}</span>
            {item.subMenus && (
              <ChevronRight
                className={cn(
                  'ml-auto transition-transform duration-200',
                  open && 'rotate-90',
                )}
              />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>

        {item.subMenus && (
          <CollapsibleContent className="!ml-1 overflow-hidden" forceMount>
            <motion.div
              initial={false}
              animate={open ? 'open' : 'closed'}
              variants={{
                open: { height: 'auto', opacity: 1 },
                closed: { height: 0, opacity: 0 },
              }}
              transition={{ duration: 0.35, ease: [0.35, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <SidebarMenuSub>
                {item.subMenus.map((subItem) => {
                  const current = stripQuery(pathname ?? '');
                  const subPath = stripQuery(subItem.path);
                  const isActive =
                    current === subPath || current.startsWith(subPath + '/');
                  const hasNestedSubMenus = Boolean(subItem.subMenus?.length);
                  const isNestedActive =
                    hasNestedSubMenus &&
                    subItem.subMenus!.some((nestedItem) => {
                      const nestedPath = stripQuery(nestedItem.path);
                      return (
                        current === nestedPath ||
                        current.startsWith(`${nestedPath}/`)
                      );
                    });

                  if (hasNestedSubMenus) {
                    return (
                      <SubMenuItem
                        key={subPath}
                        item={subItem}
                        isSubMenuActive={Boolean(isNestedActive)}
                        depth={depth + 1}
                      />
                    );
                  }

                  return (
                    <SidebarMenuSubItem key={subPath}>
                      <SidebarMenuSubButton
                        asChild
                        className={cn(
                          'hover:text-primary hover:bg-gray-200/50 !py-4',
                          depth > 0 ? '!px-6' : '!px-3',
                          isActive && '!text-primary font-medium',
                        )}
                      >
                        <Link
                          href={subItem.path}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span>
                            {getLabel(subItem.translationKey, subItem.name)}
                          </span>
                        </Link>
                      </SidebarMenuSubButton>

                      {isActive && (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-[14px] w-2 h-2 rounded-full bg-primary" />
                      )}
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </motion.div>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default SubMenuItem;
