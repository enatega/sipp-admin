'use client'

import { AppButton } from "@/components/shared/AppButton";
import { Heading } from "@/components/shared/Heading";
import { CirclePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import AddZoneDrawer from "./add-zone";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations('zones');


  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <Heading title={t('title')} />
        <div className="flex gap-2 items-center">
          <AppButton leftIcon={<CirclePlus size={16} />} onClick={() => setIsModalOpen(true)}>
            {t('addZone')}
          </AppButton>
        </div>
      </div>

      <AddZoneDrawer isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}